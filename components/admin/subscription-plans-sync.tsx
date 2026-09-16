"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  publishSyncedPlansAction,
  syncSubscriptionPlansAction,
  unpublishAllPlansAction,
} from "@/lib/actions/admin-subscriptions"
import type { PlanFungiesSyncRow } from "@/lib/membership-fungies-sync"

const OUTCOME_LABEL: Record<PlanFungiesSyncRow["outcome"], string> = {
  created: "Created",
  "plan-added": "Plan added",
  linked: "Linked",
  failed: "Failed",
}

/**
 * Runs the subscription plans → Fungies sync in small server batches until
 * nothing is left, then lets an admin publish the plans that are actually
 * sellable. Safe to click again: products already in Fungies are matched,
 * never duplicated.
 */
export function SubscriptionPlansSync({ mapped, total, published }: { mapped: number; total: number; published: number }) {
  const router = useRouter()
  const [running, setRunning] = useState(false)
  const [rows, setRows] = useState<PlanFungiesSyncRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function run() {
    setRunning(true)
    setError(null)
    setNotice(null)
    setDone(false)
    setRows([])
    try {
      // Each batch handles a few plans; the cap only guards against a loop.
      for (let batch = 0; batch < 30; batch++) {
        const result = await syncSubscriptionPlansAction()
        if ("error" in result) {
          setError(result.error)
          return
        }
        setRows((current) => [...current, ...result.rows])
        if (result.stopped) {
          setError(result.stopped)
          return
        }
        if (result.remaining === 0) {
          setDone(true)
          return
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "The sync request failed.")
    } finally {
      setRunning(false)
      router.refresh()
    }
  }

  async function publish() {
    setRunning(true)
    setError(null)
    setNotice(null)
    try {
      const result = await publishSyncedPlansAction()
      if ("error" in result) setError(result.error)
      else {
        setNotice(
          `${result.published} plan${result.published === 1 ? "" : "s"} published.` +
            (result.skipped.length ? ` Still unlisted (no Fungies plan yet): ${result.skipped.join(", ")}.` : ""),
        )
      }
    } finally {
      setRunning(false)
      router.refresh()
    }
  }

  async function unpublish() {
    setRunning(true)
    setError(null)
    setNotice(null)
    try {
      const result = await unpublishAllPlansAction()
      if ("error" in result) setError(result.error)
      else setNotice(`${result.unpublished} plan${result.unpublished === 1 ? "" : "s"} taken off the storefront.`)
    } finally {
      setRunning(false)
      router.refresh()
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={run} disabled={running} aria-busy={running}>
          {running ? "Working…" : mapped === total ? "Check Fungies again" : "Sync to Fungies"}
        </Button>
        <Button onClick={publish} disabled={running || mapped === 0} variant="outline">
          Publish synced plans
        </Button>
        <Button onClick={unpublish} disabled={running || published === 0} variant="ghost">
          Unpublish all
        </Button>
        <p className="text-sm text-muted-foreground">
          {mapped} of {total} plans set up in Fungies · {published} live on the storefront
        </p>
      </div>

      {error && (
        <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      {notice && <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-foreground">{notice}</p>}
      {done && <p className="text-sm font-medium text-foreground">Every subscription plan is set up in Fungies.</p>}

      {rows.length > 0 && (
        <ul className="flex flex-col divide-y divide-border rounded-md border border-border text-sm">
          {rows.map((row) => (
            <li key={row.slug} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
              <span className="font-medium text-foreground">{row.name}</span>
              <span className="flex items-center gap-2">
                {row.productId && <code className="font-mono text-xs text-muted-foreground">{row.productId}</code>}
                <Badge variant={row.outcome === "failed" ? "destructive" : "secondary"}>{OUTCOME_LABEL[row.outcome]}</Badge>
              </span>
              {row.error && <span className="w-full text-xs text-destructive">{row.error}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
