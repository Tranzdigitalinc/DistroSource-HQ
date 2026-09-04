import { redirect } from "next/navigation"
import { headers } from "next/headers"
import Link from "next/link"
import Image from "next/image"
import { auth } from "@/lib/auth"
import { isAdminEmail } from "@/lib/admin-emails"
import { getFinalReviewRows, type ReviewFlag } from "@/lib/queries/final-review"
import { Badge } from "@/components/ui/badge"
import { ImageOff, ICON_SIZE } from "@/lib/storefront-icons"
import { cn } from "@/lib/utils"

export const metadata = {
  title: "Final Catalog Review | DistroSource Admin",
}

export const dynamic = "force-dynamic"

const FILTERS: { value: ReviewFlag | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "needs_file", label: "Needs File" },
  { value: "needs_rights_review", label: "Needs Rights Review" },
  { value: "needs_image_review", label: "Needs Image Review" },
  { value: "needs_licence_review", label: "Needs Licence Review" },
  { value: "ready_for_launch", label: "Ready for Launch" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
]

const REVIEW_TONE: Record<string, string> = {
  approved: "border-success/30 bg-success/10 text-success",
  pending: "border-border bg-secondary text-muted-foreground",
  changes_required: "border-destructive/30 bg-destructive/10 text-destructive",
}

export default async function FinalReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user || !isAdminEmail(session.user.email)) redirect("/sign-in")

  const { filter } = await searchParams
  const all = await getFinalReviewRows()
  const rows = filter ? all.filter((r) => r.flags.includes(filter as ReviewFlag)) : all

  const counts = Object.fromEntries(
    FILTERS.map((f) => [f.value, f.value ? all.filter((r) => r.flags.includes(f.value as ReviewFlag)).length : all.length]),
  )

  const published = all.filter((r) => r.status === "published")
  const launchReady = published.filter((r) => r.blockers.length === 0)

  return (
    <div className="mx-auto max-w-[112rem] px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight">Final Catalog Review</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          A product may only be published once it has no blockers. Review status is derived from live catalog
          data, so it is always current.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
          {[
            ["Total products", all.length],
            ["Published", published.length],
            ["Published & launch-ready", launchReady.length],
            ["Blocked", all.filter((r) => r.blockers.length > 0).length],
          ].map(([label, value]) => (
            <div key={String(label)} className="bg-card px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">{label}</p>
              <p className="mt-0.5 font-display text-xl font-bold">{value as number}</p>
            </div>
          ))}
        </div>
      </header>

      <nav className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.value || "all"}
            href={f.value ? `/admin/final-review?filter=${f.value}` : "/admin/final-review"}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              (filter ?? "") === f.value
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
            <span className="ml-1.5 text-muted-foreground">{counts[f.value] ?? 0}</span>
          </Link>
        ))}
      </nav>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full min-w-[72rem] text-sm">
          <thead className="border-b border-border bg-secondary/40 text-left">
            <tr className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
              <th className="px-3 py-2.5 font-semibold">Product</th>
              <th className="px-3 py-2.5 font-semibold">Primary image</th>
              <th className="px-3 py-2.5 font-semibold">Asset</th>
              <th className="px-3 py-2.5 font-semibold">Rights</th>
              <th className="px-3 py-2.5 font-semibold">Publication</th>
              <th className="px-3 py-2.5 font-semibold">File</th>
              <th className="px-3 py-2.5 font-semibold">Format</th>
              <th className="px-3 py-2.5 font-semibold">Price</th>
              <th className="px-3 py-2.5 font-semibold">Licence</th>
              <th className="px-3 py-2.5 font-semibold">Previews</th>
              <th className="px-3 py-2.5 font-semibold">Review</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => (
              <tr key={r.id} className="align-top">
                <td className="px-3 py-3">
                  <Link href={`/admin/products/${r.id}`} className="font-medium text-foreground hover:text-primary">
                    {r.name}
                  </Link>
                  <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                    {r.department ?? "—"} / {r.category}
                  </p>
                  {r.blockers.length > 0 && (
                    <ul className="mt-1.5 space-y-0.5">
                      {r.blockers.map((b) => (
                        <li key={b} className="text-[11px] leading-snug text-destructive">
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </td>
                <td className="px-3 py-3">
                  <span className="relative flex size-12 items-center justify-center overflow-hidden rounded border border-border bg-secondary/50">
                    {r.primaryImage ? (
                      <Image src={r.primaryImage} alt="" fill sizes="48px" className="object-cover" />
                    ) : (
                      <ImageOff size={ICON_SIZE.sm} className="text-muted-foreground" aria-hidden="true" />
                    )}
                  </span>
                  {r.primaryImageIsGenerated && (
                    <p className="mt-1 font-mono text-[9px] uppercase text-muted-foreground">generated</p>
                  )}
                </td>
                <td className="px-3 py-3 text-xs">{r.assetStatus}</td>
                <td className="px-3 py-3 text-xs">{r.rightsStatus}</td>
                <td className="px-3 py-3">
                  <Badge variant={r.status === "published" ? "default" : "secondary"} className="capitalize">
                    {r.status}
                  </Badge>
                </td>
                <td className="px-3 py-3 text-xs">
                  {r.fileName ? (
                    <>
                      <span className="block max-w-[14rem] truncate">{r.fileName}</span>
                      <span
                        className={cn(
                          "font-mono text-[10px]",
                          r.fileSizeBytes === null || r.fileSizeBytes < 20000
                            ? "text-destructive"
                            : "text-muted-foreground",
                        )}
                      >
                        {r.fileSizeBytes === null ? "missing" : `${(r.fileSizeBytes / 1024).toFixed(1)} KB`}
                      </span>
                    </>
                  ) : (
                    <span className="text-destructive">none</span>
                  )}
                </td>
                <td className="px-3 py-3 font-mono text-[10px] text-muted-foreground">
                  {r.fileFormats.slice(0, 2).join(", ") || "—"}
                </td>
                <td className="px-3 py-3 font-mono text-xs">${r.basePrice}</td>
                <td className="px-3 py-3">
                  <ul className="space-y-0.5 font-mono text-[10px] text-muted-foreground">
                    {r.licences.map((l) => (
                      <li key={l.type}>
                        {l.type} ${l.price}
                      </li>
                    ))}
                    {r.licences.length === 0 && <li className="text-destructive">none</li>}
                  </ul>
                </td>
                <td className="px-3 py-3">
                  <span className={cn("font-mono text-xs", r.previewCount >= 4 ? "text-foreground" : "text-destructive")}>
                    {r.previewCount}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span
                    className={cn(
                      "inline-block whitespace-nowrap rounded border px-2 py-0.5 font-mono text-[10px] uppercase",
                      REVIEW_TONE[r.reviewStatus],
                    )}
                  >
                    {r.reviewStatus.replace("_", " ")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && (
        <p className="mt-6 text-center text-sm text-muted-foreground">No products match this filter.</p>
      )}
    </div>
  )
}
