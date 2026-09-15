import { notFound, redirect } from "next/navigation"
import { headers } from "next/headers"
import Link from "next/link"
import type { ReactNode } from "react"
import { ExternalLink, Info } from "lucide-react"
import { auth } from "@/lib/auth"
import { isAdminEmail } from "@/lib/admin-emails"
import { GAMING_CATALOG } from "@/lib/gaming/catalog/products"
import { FRAMEWORK_LABEL, SUBSCRIPTION_MODELS, categoryLabel, platformLabel } from "@/lib/gaming/catalog/taxonomy"
import { annualSaving, formatGamingPrice } from "@/lib/gaming/catalog/pricing"
import { GamingImage } from "@/components/gaming/gaming-image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const bySlug = (slug: string) => GAMING_CATALOG.find((p) => p.slug === slug) ?? null

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = bySlug(slug)
  return {
    title: product ? `${product.title} | DistroSource Admin` : "Gaming product | DistroSource Admin",
    description: "Gaming product record.",
  }
}

export function generateStaticParams() {
  return GAMING_CATALOG.map((p) => ({ slug: p.slug }))
}

function Field({ label, value, mono = false }: { label: string; value: ReactNode; mono?: boolean }) {
  return (
    <div className="border-b border-border py-3 last:border-b-0">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
      <div className={mono ? "mt-1 break-all font-mono text-sm text-foreground" : "mt-1 text-sm text-foreground"}>{value}</div>
    </div>
  )
}

function ListCard({ title, items }: { title: string; items?: string[] }) {
  if (!items || items.length === 0) return null
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm leading-6 text-muted-foreground">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export default async function AdminGamingProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect(`/sign-in?next=/admin/gaming/${slug}`)
  if (!isAdminEmail(session.user.email)) redirect("/")

  const product = bySlug(slug)
  if (!product) notFound()
  const saving = annualSaving(product.pricing)
  const words = product.description.join(" ").split(/\s+/).filter(Boolean).length

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Gaming product</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">{product.title}</h1>
          <p className="mt-2 font-mono text-xs text-muted-foreground">{product.id}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant={product.availability === "on-sale" ? "default" : "outline"}>{product.availability}</Badge>
            {product.models.map((m) => (
              <Badge key={m} variant="secondary">
                {SUBSCRIPTION_MODELS[m].label}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" render={<Link href="/admin/gaming" />} nativeButton={false}>
            Back to Gaming
          </Button>
          <Button variant="outline" size="sm" render={<Link href={`/gaming/product/${product.slug}`} />} nativeButton={false}>
            <ExternalLink className="size-3.5" aria-hidden="true" />
            Storefront
          </Button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Catalogue fields</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Field label="Slug" value={`/gaming/product/${product.slug}`} mono />
              <Field label="Platform" value={platformLabel(product.platform)} />
              <Field label="Category" value={categoryLabel(product.platform, product.category)} />
              <Field label="Tags" value={product.tags.join(", ")} />
              <Field label="Frameworks" value={product.frameworks.length ? product.frameworks.map((f) => FRAMEWORK_LABEL[f]).join(", ") : "—"} />
              <Field
                label="Pricing"
                value={
                  product.pricing.kind === "one-time" ? (
                    formatGamingPrice(product.pricing.price)
                  ) : (
                    <span>
                      {formatGamingPrice(product.pricing.monthly)}/month
                      {saving && (
                        <span className="text-muted-foreground">
                          {" "}
                          · {formatGamingPrice(saving.annual)}/year (saves {saving.percent}%, {formatGamingPrice(saving.amount)})
                        </span>
                      )}
                    </span>
                  )
                }
              />
              <Field label="Released" value={product.releasedAt} mono />
              <Field label="Updated" value={product.updatedAt} mono />
              <Field label="Curation order" value={String(product.curation)} mono />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Copy</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Field label="Summary" value={product.summary} />
              <Field label={`Description · ${words} words`} value={<div className="flex flex-col gap-2 leading-6 text-muted-foreground">{product.description.map((p) => <p key={p.slice(0, 24)}>{p}</p>)}</div>} />
            </CardContent>
          </Card>

          <ListCard title="What you get" items={product.whatYouGet} />
          <ListCard title="Eligible resource types" items={product.eligibleResourceTypes} />
          <ListCard title="Features" items={product.features.map((f) => `${f.title} — ${f.body}`)} />
          <ListCard title="Compatibility" items={product.compatibility} />
          <ListCard title="Requirements" items={product.requirements} />
          <ListCard title="Cadence" items={product.cadence} />
          <ListCard title="License" items={product.license} />
          <ListCard title="Installation" items={product.installation} />
          <ListCard title="After cancellation" items={product.afterCancel} />
        </div>

        <aside className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Media</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {product.media.map((m) => {
                const image = m.kind === "video" ? m.poster : m
                return (
                  <div key={image.src} className="flex flex-col gap-1.5">
                    <div className="overflow-hidden rounded-md border border-border bg-secondary">
                      <GamingImage image={image} sizes="320px" className="aspect-[16/10] h-auto w-full object-cover" />
                    </div>
                    <p className="break-all font-mono text-[11px] text-muted-foreground">{image.src}</p>
                    <Badge variant="outline" className="w-fit">
                      {m.kind === "video" ? "video" : image.provenance}
                    </Badge>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="flex-row items-start gap-3 space-y-0">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Info className="size-4.5" aria-hidden="true" />
              </span>
              <div>
                <CardTitle className="text-base font-semibold">Editing this record</CardTitle>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Edit <code className="rounded bg-background px-1 py-0.5 font-mono text-xs">lib/gaming/catalog/products.ts</code>. Images are produced by{" "}
                  <code className="rounded bg-background px-1 py-0.5 font-mono text-xs">scripts/gaming/banners/</code> and written to{" "}
                  <code className="rounded bg-background px-1 py-0.5 font-mono text-xs">public/gaming/catalog/</code>.
                </p>
              </div>
            </CardHeader>
          </Card>
        </aside>
      </div>
    </main>
  )
}
