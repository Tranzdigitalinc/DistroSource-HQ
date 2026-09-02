import Link from "next/link"
import { redirect } from "next/navigation"
import { headers as nextHeaders } from "next/headers"
import { ArrowLeft } from "lucide-react"
import { auth } from "@/lib/auth"
import { getTeamLicenseRequests } from "@/lib/actions/admin-team-licensing"
import { isAdminEmail } from "@/lib/admin-emails"
import { Button } from "@/components/ui/button"
import { TeamLicenseStatusSelect } from "@/components/admin/team-license-status-select"

export const metadata = {
  title: "Team licensing | DistroSource Admin",
  description: "Respond to bulk seat and agency licensing requests.",
}

export default async function AdminTeamLicensingPage() {
  const session = await auth.api.getSession({ headers: await nextHeaders() })
  if (!session?.user || !isAdminEmail(session.user.email)) redirect("/sign-in")

  const requests = await getTeamLicenseRequests()

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <header>
        <Button variant="outline" size="sm" render={<Link href="/admin" />} nativeButton={false}>
          <ArrowLeft className="h-4 w-4" />
          Admin
        </Button>
        <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-foreground">Team licensing</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {requests.length} request{requests.length === 1 ? "" : "s"} submitted from the team licensing page.
        </p>
      </header>

      <div className="flex flex-col gap-3">
        {requests.length === 0 ? (
          <div className="flex items-center justify-center rounded-xl border border-dashed border-border py-16 text-sm text-muted-foreground">
            No team licensing requests yet.
          </div>
        ) : (
          requests.map((request) => (
            <div key={request.id} className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-border bg-card p-4">
              <div className="min-w-0">
                <p className="font-medium text-foreground">{request.companyName}</p>
                <p className="text-sm text-muted-foreground">
                  {request.contactName} · {request.contactEmail}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {request.productInterest ? `Interested in: ${request.productInterest}` : "No product specified"}
                  {request.seatsEstimate ? ` · ~${request.seatsEstimate} seats` : ""}
                  {request.budgetUsd ? ` · Budget: $${Number.parseFloat(request.budgetUsd).toFixed(2)}` : ""}
                </p>
                {request.message ? <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{request.message}</p> : null}
                <p className="mt-2 text-xs text-muted-foreground">Submitted {request.createdAt.toLocaleString()}</p>
              </div>
              <TeamLicenseStatusSelect requestId={request.id} status={request.status} />
            </div>
          ))
        )}
      </div>
    </main>
  )
}
