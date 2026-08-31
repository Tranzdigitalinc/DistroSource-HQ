import { NextResponse } from "next/server"
import { and, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { brands, cartItems, categories, orderItems, orders, productVariants, products, reviews, wishlistItems } from "@/lib/db/schema"
import { getSession } from "@/lib/session"
import { fetchAllReloadlyProducts, getDenominations, getProductImage } from "@/lib/reloadly"

export const runtime = "nodejs"

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 180) || "catalog-item"
}

function money(value: number) {
  return Math.max(0, Number(value || 0)).toFixed(2)
}

export async function POST(request: Request) {
  const session = await getSession()
  const userEmail = session?.user?.email?.trim().toLowerCase()
  if (userEmail !== "info@corevalleyjo.com") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 })
  }

  let body: { confirm?: boolean } = {}
  try { body = await request.json() } catch { /* empty body is valid JSON failure */ }
  if (body.confirm !== true) {
    return NextResponse.json({ error: "This destructive sync requires { confirm: true }" }, { status: 400 })
  }

  try {
    console.log("[v0] Reloadly sync: fetching catalog")
    const catalog = await fetchAllReloadlyProducts()
    console.log(`[v0] Reloadly sync: received ${catalog.length} products`)
    if (!catalog.length) return NextResponse.json({ error: "Reloadly returned no products; existing catalog was preserved" }, { status: 502 })

    const result = await db.transaction(async (tx) => {
      console.log("[v0] Reloadly sync: clearing dependent records")
      await tx.delete(orderItems)
      await tx.delete(orders)
      await tx.delete(reviews)
      await tx.delete(cartItems)
      await tx.delete(wishlistItems)
      await tx.delete(productVariants)
      await tx.delete(products)
      await tx.delete(brands)
      await tx.delete(categories)

      console.log("[v0] Reloadly sync: inserting normalized catalog")
      const categoryMap = new Map<number, number>()
      const brandMap = new Map<number, number>()
      const categoryRows = [...new Map(catalog.map((p) => [p.category?.id ?? 0, p.category?.name ?? "Other"])).entries()]
      for (const [reloadlyId, name] of categoryRows) {
        const [row] = await tx.insert(categories).values({ slug: `${slugify(name)}-${reloadlyId}`, name, description: `Reloadly ${name} gift cards`, iconName: "tag", sortOrder: categoryMap.size, reloadlyCategoryId: reloadlyId || null }).returning({ id: categories.id })
        categoryMap.set(reloadlyId, row.id)
      }

      const brandRows = [...new Map(catalog.map((p) => [p.brand?.brandId ?? 0, p.brand?.brandName ?? "Other"])).entries()]
      for (const [reloadlyId, name] of brandRows) {
        const [row] = await tx.insert(brands).values({ slug: `${slugify(name)}-${reloadlyId}`, name, categoryId: categoryMap.get(catalog.find((p) => (p.brand?.brandId ?? 0) === reloadlyId)?.category?.id ?? 0) ?? [...categoryMap.values()][0], logoUrl: getProductImage(catalog.find((p) => (p.brand?.brandId ?? 0) === reloadlyId)!), reloadlyBrandId: reloadlyId || null }).returning({ id: brands.id })
        brandMap.set(reloadlyId, row.id)
      }

      let variantCount = 0
      for (const product of catalog) {
        const categoryId = categoryMap.get(product.category?.id ?? 0) ?? [...categoryMap.values()][0]
        const brandId = brandMap.get(product.brand?.brandId ?? 0) ?? [...brandMap.values()][0]
        const [inserted] = await tx.insert(products).values({ slug: `${slugify(product.productName)}-${product.id}`, name: product.productName, brandId, categoryId, productType: "gift_card", shortDescription: `${product.productName} digital gift card`, description: `Buy a ${product.productName} gift card and receive your code instantly.`, imageUrl: getProductImage(product), deliveryType: "instant_code", reloadlyProductId: product.id }).returning({ id: products.id })
        const denominations = getDenominations(product)
        if (!denominations.length) continue
        await tx.insert(productVariants).values(denominations.map((amount: number, index: number) => ({ productId: inserted.id, denominationLabel: `$${money(amount)}`, faceValueUsd: money(amount), priceUsd: money(amount * (1 - (product.discountPercentage ?? 0) / 100) + (product.senderFee ?? 0)), discountPercent: Math.max(0, Math.round(product.discountPercentage ?? 0)), stockCount: 500, sortOrder: index, reloadlyVariantId: `${product.id}-${amount}` })))
        variantCount += denominations.length
      }
      return { productCount: catalog.length, variantCount, categoryCount: categoryMap.size, brandCount: brandMap.size }
    })

    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error("[v0] Reloadly catalog sync failed:", error)
    const detail = error instanceof Error ? error.message.slice(0, 240) : "Unknown sync error"
    return NextResponse.json(
      { error: "Reloadly sync failed; the database transaction was rolled back", detail },
      { status: 502 },
    )
  }
}
