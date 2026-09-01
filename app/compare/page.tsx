import Link from "next/link"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { getProductsByIds } from "@/lib/queries/catalog"

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ compare?: string }> }) {
  const params = await searchParams
  const ids = (params.compare ?? "").split(",").map(Number).filter(Number.isFinite).slice(0, 4)
  const items = await getProductsByIds(ids)

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10 sm:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Side by side</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Compare products</h1>
          <p className="mt-2 text-sm text-muted-foreground">Review delivery, country, ratings, and starting prices before you choose.</p>
        </div>
        {items.length ? (
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="border-b border-border bg-secondary/40"><tr><th className="p-4 font-semibold">Product</th>{items.map((item) => <th key={item.product.id} className="p-4 font-semibold">{item.product.name}</th>)}</tr></thead>
              <tbody className="divide-y divide-border">
                {[["Brand", ...items.map((item) => item.brand.name)], ["Category", ...items.map((item) => item.category.name)], ["Country", ...items.map((item) => item.country?.name ?? "Global")], ["Delivery", ...items.map((item) => item.product.deliveryType === "instant_code" ? "Instant code" : item.product.deliveryType)], ["Rating", ...items.map((item) => `${item.product.rating} / 5`)], ["From", ...items.map((item) => `$${Math.min(...item.variants.map((v) => Number(v.priceUsd))).toFixed(2)}`)]].map(([label, ...values]) => <tr key={label}><th className="p-4 font-medium text-muted-foreground">{label}</th>{values.map((value, index) => <td key={`${label}-${index}`} className="p-4 text-foreground">{value}</td>)}</tr>)}
              </tbody>
            </table>
          </div>
        ) : <div className="flex flex-col gap-3 rounded-xl border border-dashed border-border bg-card p-12 text-center"><h2 className="font-display text-xl font-semibold">Choose products to compare</h2><p className="text-sm text-muted-foreground">Open a product and use Compare to build a side-by-side shortlist.</p><Link href="/products" className="mx-auto text-sm font-semibold text-accent hover:underline">Browse products</Link></div>}
      </main>
      <SiteFooter />
    </div>
  )
}
