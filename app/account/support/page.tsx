import { getUserSupportTickets } from "@/lib/actions/account"
import { SupportTicketForm } from "@/components/account/support-ticket-form"
import { Badge } from "@/components/ui/badge"

export const metadata = {
  title: "Support — DistroSource",
}

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  open: "default",
  pending: "outline",
  resolved: "secondary",
}

export default async function AccountSupportPage() {
  const tickets = await getUserSupportTickets()

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-display text-lg font-semibold">Contact support</h2>
        <p className="text-sm text-muted-foreground">
          Send us a message and we&apos;ll follow up by email. For code issues, include your order number.
        </p>
      </div>

      <SupportTicketForm />

      <div>
        <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Your tickets
        </h3>
        {tickets.length === 0 ? (
          <p className="text-sm text-muted-foreground">You haven&apos;t submitted any support tickets yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="flex flex-wrap items-start justify-between gap-3 p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{ticket.subject}</p>
                    <Badge variant={statusVariant[ticket.status] ?? "outline"} className="capitalize">
                      {ticket.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{ticket.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {ticket.orderNumber ? `Order ${ticket.orderNumber} · ` : ""}
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
