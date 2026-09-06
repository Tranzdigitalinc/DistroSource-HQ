"use client"

import { useState } from "react"
import { GamingPreview } from "@/components/gaming/gaming-preview"
import type { GamingPreviewKind } from "@/lib/gaming/types"
import { cn } from "@/lib/utils"

/**
 * Product gallery for a Gaming product.
 *
 * Until real captures exist in `images[]`, this shows illustrative previews
 * and says so beneath them. It never labels a drawing as a screenshot of the
 * delivered files.
 */
export function GamingGallery({ kind, seed, title }: { kind: GamingPreviewKind; seed: number; title: string }) {
  // Offsets chosen so the three views land on different plan/layout variants
  // rather than three near-identical drawings.
  const views = [seed, seed + 37, seed + 74]
  const [active, setActive] = useState(0)

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-secondary">
        <GamingPreview kind={kind} seed={views[active]} />
      </div>

      <div className="grid grid-cols-3 gap-2" role="tablist" aria-label={`${title} previews`}>
        {views.map((v, i) => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={`Preview ${i + 1} of ${views.length}`}
            onClick={() => setActive(i)}
            className={cn(
              "relative aspect-[4/3] overflow-hidden rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              i === active ? "border-foreground" : "border-border hover:border-border-strong",
            )}
          >
            <GamingPreview kind={kind} seed={v} />
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Illustrative previews showing the structure of this product. Full captures are added as each product is
        photographed.
      </p>
    </div>
  )
}
