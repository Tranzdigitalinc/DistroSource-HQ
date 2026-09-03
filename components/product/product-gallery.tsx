"use client"

import { useState } from "react"
import { ImageOff } from "lucide-react"

interface ProductGalleryProps {
  images: string[]
  alt: string
}

export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [failed, setFailed] = useState<string[]>([])
  const [selected, setSelected] = useState(images[0] ?? "")
  const available = images.filter((src) => !failed.includes(src))
  const hero = available.includes(selected) ? selected : available[0]

  function markFailed(src: string) {
    setFailed((current) => (current.includes(src) ? current : [...current, src]))
  }

  function validateQuality(src: string, image: HTMLImageElement) {
    // Envato exposes tiny icon/badge assets alongside the real screenshots.
    // They technically load successfully but become visibly blurry when
    // enlarged, so treat them as unusable gallery media.
    if (image.naturalWidth < 400 || image.naturalHeight < 250) markFailed(src)
  }

  if (!hero) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center border border-border bg-secondary text-muted-foreground/40">
        <ImageOff className="size-10" aria-hidden="true" />
        <span className="sr-only">Product images unavailable</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="group relative aspect-[4/3] w-full overflow-hidden border border-border bg-secondary">
        <img
          src={hero}
          alt={alt}
          className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-[1.02]"
          onError={() => markFailed(hero)}
          onLoad={(event) => validateQuality(hero, event.currentTarget)}
        />
      </div>
      {available.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {available.slice(1, 5).map((src, index) => (
            <button
              type="button"
              key={src}
              className="relative aspect-[4/3] overflow-hidden border border-border bg-secondary text-left transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => setSelected(src)}
              aria-label={`View product image ${index + 2}`}
            >
              <img
                src={src}
                alt=""
                className="h-full w-full object-contain"
                onError={() => markFailed(src)}
                onLoad={(event) => validateQuality(src, event.currentTarget)}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
