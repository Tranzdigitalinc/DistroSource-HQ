import type { GamingImage as GamingImageData } from "@/lib/gaming/catalog/types"
import { cn } from "@/lib/utils"

interface GamingImageProps {
  image: GamingImageData
  /** Standard `sizes` attribute describing the rendered width. */
  sizes: string
  /** Above-the-fold images load eagerly with high priority. */
  priority?: boolean
  className?: string
}

/**
 * Responsive product image.
 *
 * Next's optimiser is disabled for this site, so the pipeline pre-renders
 * each image at 1600, 1200 and 800 px and this component lets the browser
 * pick one. Width and height are always set so nothing shifts on load.
 */
export function GamingImage({ image, sizes, priority = false, className }: GamingImageProps) {
  const set = [...(image.renditions ?? []), { src: image.src, width: image.width }]
    .sort((a, b) => a.width - b.width)
    .map((r) => `${r.src} ${r.width}w`)
    .join(", ")
  return (
    // eslint-disable-next-line @next/next/no-img-element -- pre-rendered renditions, optimiser disabled
    <img
      src={image.src}
      srcSet={set}
      sizes={sizes}
      width={image.width}
      height={image.height}
      alt={image.alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      className={cn("block", className)}
    />
  )
}
