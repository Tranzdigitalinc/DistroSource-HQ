import Link from "next/link"
import { Download } from "@/lib/storefront-icons"
import { getUserDownloadHistory } from "@/lib/actions/account"
import { formatDateTime } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal"

export const metadata = {
  title: "Download history — DistroSource",
}

export default async function AccountDownloadsPage() {
  const history = await getUserDownloadHistory()

  if (history.length === 0) {
    return (
      <Reveal className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-secondary/30 py-16 text-center">
        <Download className="size-8 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">You haven&apos;t downloaded anything yet.</p>
        <Button size="sm" render={<Link href="/account/library" />} nativeButton={false}>
          Go to My Library
        </Button>
      </Reveal>
    )
  }

  return (
    <RevealGroup className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card" stagger={0.04}>
      {history.map((row) => (
        <RevealItem key={row.downloadEvent.id}>
          <div className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{row.product.name}</p>
              <p className="text-xs text-muted-foreground">
                {row.file.fileName} · {formatDateTime(row.downloadEvent.downloadedAt)}
              </p>
            </div>
            <Button size="sm" variant="outline" className="bg-transparent" render={<a href={`/api/downloads/${row.file.id}`} />} nativeButton={false}>
              <Download className="size-3.5" />
              Download again
            </Button>
          </div>
        </RevealItem>
      ))}
    </RevealGroup>
  )
}
