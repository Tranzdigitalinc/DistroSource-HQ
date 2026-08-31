"use client"

import { useState } from "react"

export function ReloadlySyncPanel() {
  const [confirm, setConfirm] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function runSync() {
    if (!confirm) return
    setIsSyncing(true)
    setMessage(null)
    setError(null)

    try {
      const response = await fetch("/api/admin/reloadly/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true }),
      })
      const result = (await response.json()) as { error?: string; imported?: number; deleted?: number }
      if (!response.ok) throw new Error(result.error ?? "Catalog sync failed")
      setMessage(`Sync complete. Imported ${result.imported ?? 0} products and removed ${result.deleted ?? 0} related records.`)
      setConfirm(false)
    } catch (syncError) {
      setError(syncError instanceof Error ? syncError.message : "Catalog sync failed")
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Reloadly catalog</p>
        <h2 className="font-display text-2xl font-semibold text-foreground">Replace product catalog</h2>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Fetch every available Reloadly product and save its category, brand, images, prices, and denominations.
        </p>
      </div>

      <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
        <p className="text-sm font-medium text-foreground">Destructive operation</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          This removes existing products and all related cart items, wishlist items, reviews, and order-item records before importing the new catalog.
        </p>
        <label className="mt-4 flex items-start gap-3 text-sm text-foreground">
          <input
            type="checkbox"
            checked={confirm}
            onChange={(event) => setConfirm(event.target.checked)}
            className="mt-1 size-4 accent-primary"
          />
          <span>I understand that this will permanently remove existing product-related records.</span>
        </label>
      </div>

      <button
        type="button"
        onClick={runSync}
        disabled={!confirm || isSyncing}
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSyncing ? "Syncing Reloadly products…" : "Sync Reloadly catalog"}
      </button>

      {message ? <p className="mt-4 text-sm text-primary">{message}</p> : null}
      {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
    </section>
  )
}
