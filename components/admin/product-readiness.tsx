import { AlertTriangle, CheckCircle2, FileCheck2, ImageIcon, PackageCheck, ShieldCheck } from "@/lib/admin-icons"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function CheckRow({ complete, icon: Icon, label, detail }: { complete: boolean; icon: typeof ImageIcon; label: string; detail: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border/70 bg-secondary/30 p-3">
      <Icon className={complete ? "mt-0.5 size-4 text-success" : "mt-0.5 size-4 text-warning"} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs leading-relaxed text-muted-foreground">{detail}</p>
      </div>
      <Badge variant={complete ? "secondary" : "outline"}>{complete ? "Ready" : "Needs review"}</Badge>
    </div>
  )
}

const APPROVED_RIGHTS_STATUSES = new Set(["original", "licensed_for_distribution", "supplier_verified"])

export function ProductReadiness({
  status,
  thumbnailUrl,
  coverImageUrl,
  imageCount,
  fileCount,
  licenseCount,
  description,
  rightsStatus,
}: {
  status: string
  thumbnailUrl: string | null
  coverImageUrl: string | null
  imageCount: number
  fileCount: number
  licenseCount: number
  description: string | null
  rightsStatus: string
}) {
  const checks = [
    { complete: Boolean(thumbnailUrl && coverImageUrl), icon: ImageIcon, label: "Real product imagery", detail: "Add a verified thumbnail and cover image. Do not use generated or placeholder art." },
    { complete: fileCount > 0, icon: FileCheck2, label: "Downloadable files", detail: "Attach the actual customer deliverable and confirm it opens before publishing." },
    { complete: licenseCount > 0, icon: PackageCheck, label: "License and pricing", detail: "At least one license tier must be configured with a server-side price." },
    { complete: Boolean(description?.trim()), icon: CheckCircle2, label: "Accurate product description", detail: "Describe exactly what is included, compatible software, and any limitations." },
    {
      complete: APPROVED_RIGHTS_STATUSES.has(rightsStatus),
      icon: ShieldCheck,
      label: "Distribution rights approved",
      detail:
        rightsStatus === "pending_verification"
          ? "Rights are pending verification. This product cannot be published or sold until approved."
          : rightsStatus === "rejected"
            ? "Rights were rejected. This product cannot be published or sold."
            : "Rights status confirms DistroSource has verified permission to sell this asset.",
    },
  ]
  const ready = checks.every((check) => check.complete)

  return (
    <Card className={ready ? "border-success/30" : "border-warning/30"}>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            {ready ? <CheckCircle2 className="size-4 text-success" /> : <AlertTriangle className="size-4 text-warning" />}
            Publishing readiness
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            {ready ? "The required catalog fields are present. Verify provenance before publishing." : "Complete the missing checks before presenting this product as ready for sale."}
          </p>
        </div>
        <Badge variant={status === "published" ? "default" : "outline"}>{status}</Badge>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-2">
        {checks.map((check) => <CheckRow key={check.label} {...check} />)}
      </CardContent>
    </Card>
  )
}
