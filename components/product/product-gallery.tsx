"use client"

import Image from "next/image"
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
        <Image
          src={hero}
          alt={alt}
          fill
          priority
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
          onError={() => markFailed(hero)}
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
              <Image
                src={src}
                alt=""
                fill
                className="object-cover"
                sizes="20vw"
                onError={() => markFailed(src)}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
