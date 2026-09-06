"use client"

import { useState } from "react"
import Image from "next/image"
import { GamingPreview } from "@/components/gaming/gaming-preview"
import { hasRealImages, resolveGamingImage } from "@/lib/gaming/images"
import type { GamingArt } from "@/lib/gaming/types"
import { cn } from "@/lib/utils"

/**
 * Product gallery for a Gaming product.
 *
 * Real captures win. When `images` holds anything, that is the gallery and
 * the illustrated `art` scenes are not shown at all — no mixing, because a
 * drawing sitting next to a screenshot makes the screenshot look worse and
 * invites the reader to mistake one for the other.
 *
 * The illustrated fallback carries a caption saying what it is.
 */
export function GamingGallery({ images, art, title }: { images: string[]; art: GamingArt[]; title: string }) {
  const real = hasRealImages(images)
  const views: (string | GamingArt)[] = real ? images.filter((s) => s.trim()) : art
  const [active, setActive] = useState(0)
  if (views.length === 0) return null

  const index = Math.min(active, views.length - 1)
  const current = views[index]

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-secondary">
        {typeof current === "string" ? (
          <Image
            src={resolveGamingImage(current)}
            alt={`${title} — view ${index + 1} of ${views.length}`}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 60vw"
            priority
          />
        ) : (
          <GamingPreview art={current} />
        )}
      </div>

      {views.length > 1 && (
        <div className="grid grid-cols-3 gap-2" role="tablist" aria-label={`${title} previews`}>
          {views.map((view, i) => (
            <button
              key={typeof view === "string" ? view : view.caption}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={typeof view === "string" ? `View ${i + 1}` : view.caption}
              onClick={() => setActive(i)}
              className={cn(
                "relative aspect-[4/3] overflow-hidden rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                i === index ? "border-foreground" : "border-border hover:border-border-strong",
              )}
            >
              {typeof view === "string" ? (
                <Image src={resolveGamingImage(view)} alt="" fill className="object-cover" sizes="20vw" />
              ) : (
                <GamingPreview art={view} />
              )}
            </button>
          ))}
        </div>
      )}

      {!real && (
        <p className="text-xs text-muted-foreground">
          Illustrations of what this product contains, drawn by DistroSource. These are illustrations, not screenshots —
          in-game captures replace them once this product has been shot.
        </p>
      )}
    </div>
  )
}
