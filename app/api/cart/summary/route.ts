import { getCartItems } from "@/lib/actions/cart"
import { NextResponse } from "next/server"

/**
 * Feeds both the header badge and the cart drawer from one cache key, so the
 * two can never disagree about what is in the cart.
 *
 * getCartItems() is owner-scoped (signed-in user or guest cookie), so this
 * only ever returns the caller's own cart. Prices are echoed for display;
 * checkout re-prices every line from the database regardless.
 */
export async function GET() {
  const rows = await getCartItems()
  const count = rows.reduce((sum, i) => sum + i.cartItem.quantity, 0)
  const subtotal = rows.reduce((sum, i) => sum + Number.parseFloat(i.license.price) * i.cartItem.quantity, 0)

  return NextResponse.json({
    count,
    subtotal: Math.round(subtotal * 100) / 100,
    items: rows.map((row) => ({
      cartItemId: row.cartItem.id,
      productSlug: row.product.slug,
      productName: row.product.name,
      licenseType: row.license.licenseType,
      unitPriceUsd: row.license.price,
      quantity: row.cartItem.quantity,
      imageUrl: row.imageUrl,
    })),
  })
}
