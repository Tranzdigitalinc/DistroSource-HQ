"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { syncGamingPlansAction } from "@/lib/actions/admin-gaming"
import type { GamingFungiesSyncRow } from "@/lib/gaming/fungies-sync"

const OUTCOME_LABEL: Record<GamingFungiesSyncRow["outcome"], string> = {
  created: "Created",
  "plan-added": "Plan added",
  linked: "Linked",
  failed: "Failed",
}

/**
 * Runs the Gaming → Fungies sync in small server batches until nothing is
 * left, so no single request can hit the function time limit. Safe to click
 * again: products already in Fungies are matched, never duplicated.
 */
export function GamingFungiesSync({ mapped, total }: { mapped: number; total: number }) {
  const router = useRouter()
  const [running, setRunning] = useState(false)
  const [rows, setRows] = useState<GamingFungiesSyncRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function run() {
    setRunning(true)
    setError(null)
    setDone(false)
    setRows([])
    try {
      // Each batch handles a few plans; the cap only guards against a loop.
      for (let batch = 0; batch < 30; batch++) {
        const result = await syncGamingPlansAction()
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={run} disabled={running} aria-busy={running}>
          {running ? "Syncing…" : mapped === total ? "Check Fungies again" : "Sync to Fungies"}
        </Button>
        <p className="text-sm text-muted-foreground">
          {mapped} of {total} plans set up in Fungies
        </p>
      </div>
      {error && (
        <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      {done && <p className="text-sm font-medium text-foreground">Every Gaming plan is set up in Fungies.</p>}
      {rows.length > 0 && (
        <ul className="flex flex-col divide-y divide-border rounded-md border border-border text-sm">
          {rows.map((row) => (
            <li key={row.slug} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
              <span className="font-medium text-foreground">{row.title}</span>
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
