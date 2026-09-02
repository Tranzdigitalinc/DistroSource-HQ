import Link from "next/link"
import { Download, Library } from "lucide-react"
import { getUserLibrary } from "@/lib/actions/account"
import { formatLicenseType } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal"

export const metadata = {
  title: "My library — DistroSource",
}

export default async function AccountLibraryPage() {
  const library = await getUserLibrary()

  if (library.length === 0) {
    return (
      <Reveal className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-secondary/30 py-16 text-center">
        <Library className="size-8 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">You don&apos;t own any products yet.</p>
        <Button size="sm" render={<Link href="/products" />} nativeButton={false}>
          Browse products
        </Button>
      </Reveal>
    )
  }

  return (
    <RevealGroup className="flex flex-col gap-4" stagger={0.05}>
      {library.map((row) => (
        <RevealItem key={row.entitlement.id}>
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold">{row.product.name}</p>
                <Badge variant="secondary">{formatLicenseType(row.license.licenseType)}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Purchased {new Date(row.entitlement.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {row.files.length === 0 ? (
                <span className="text-xs text-muted-foreground">No files available yet</span>
              ) : (
                row.files.map((file) => (
                  <Button key={file.id} size="sm" variant="outline" className="bg-transparent" render={<a href={`/api/downloads/${file.id}`} />} nativeButton={false}>
                    <Download className="size-3.5" />
                    {file.fileName}
                  </Button>
                ))
              )}
            </div>
          </div>
        </RevealItem>
      ))}
    </RevealGroup>
  )
}
