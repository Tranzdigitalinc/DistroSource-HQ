import { getReloadlySyncHealth } from "@/lib/actions/operations"
import { Badge } from "@/components/ui/badge"

export async function ReloadlySyncHealth() {
  const { lastSuccess, lastFailure } = await getReloadlySyncHealth()
  const failureIsStale = lastSuccess && lastFailure ? lastSuccess.createdAt > lastFailure.createdAt : false
  const showFailure = lastFailure && !failureIsStale

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="rounded-lg border border-border bg-secondary/30 p-3">
        <p className="text-xs text-muted-foreground">Last successful sync</p>
        <p className="mt-1 text-sm font-medium text-foreground">
          {lastSuccess ? lastSuccess.createdAt.toLocaleString() : "Never synced yet"}
        </p>
      </div>
      <div className="rounded-lg border border-border bg-secondary/30 p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">Last failure</p>
          {showFailure ? <Badge variant="destructive">Open</Badge> : null}
        </div>
        <p className="mt-1 text-sm font-medium text-foreground">
          {showFailure ? lastFailure!.createdAt.toLocaleString() : "No open failures"}
        </p>
        {showFailure ? (
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {(lastFailure!.payload as { detail?: string })?.detail ?? "Unknown error"} — re-run the sync below once resolved.
          </p>
        ) : null}
      </div>
    </div>
  )
}
