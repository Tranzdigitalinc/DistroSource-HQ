"use client"

import { useState } from "react"
import { GamingPreview } from "@/components/gaming/gaming-preview"
import type { GamingArt } from "@/lib/gaming/types"
import { cn } from "@/lib/utils"

/**
 * Product gallery for a Gaming product.
 *
 * Each view is a distinct scene from the product — a different room, a
 * different screen — not the same image three times. Until in-game captures
 * exist in `images[]`, this shows the illustrations and says so beneath them.
 * It never labels an illustration as a screenshot.
 */
export function GamingGallery({ art, title }: { art: GamingArt[]; title: string }) {
  const [active, setActive] = useState(0)
  const views = art.length > 0 ? art : []
  if (views.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-secondary">
        <GamingPreview art={views[active]} />
      </div>

      {views.length > 1 && (
        <div className="grid grid-cols-3 gap-2" role="tablist" aria-label={`${title} previews`}>
          {views.map((view, i) => (
            <button
              key={view.caption}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={view.caption}
              onClick={() => setActive(i)}
              className={cn(
                "relative aspect-[4/3] overflow-hidden rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                i === active ? "border-foreground" : "border-border hover:border-border-strong",
              )}
            >
              <GamingPreview art={view} />
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Illustrations of what this product contains, drawn by DistroSource. In-game captures are added as each
        product is shot — these are illustrations, not screenshots.
      </p>
    </div>
  )
}
