import Image from "next/image"
import { cn } from "@/lib/utils"

/**
 * Branded product thumbnail: uses the brand's real logo centered over the
 * brand's real signature color as a background, instead of a generic
 * category placeholder image. Falls back to a neutral secondary background
 * if the brand has no logo/color on file.
 */
export function BrandThumbnail({
  logoUrl,
  brandColor,
  brandName,
  className,
  logoClassName,
}: {
  logoUrl: string | null
  brandColor: string | null
  brandName: string
  className?: string
  logoClassName?: string
}) {
  return (
    <div
      className={cn("relative flex size-full items-center justify-center overflow-hidden", className)}
      style={{ backgroundColor: brandColor ?? undefined }}
    >
      {!brandColor && <div className="absolute inset-0 bg-secondary" aria-hidden="true" />}
      {/* subtle radial glow for depth on the flat brand color */}
      {brandColor && (
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.25), transparent 60%)",
          }}
          aria-hidden="true"
        />
      )}
      {logoUrl ? (
        <div
          className={cn(
            "relative z-10 flex aspect-square w-[46%] max-w-32 items-center justify-center rounded-2xl bg-white p-[12%] shadow-lg",
            logoClassName,
          )}
        >
          <Image
            src={logoUrl || "/placeholder.svg"}
            alt={`${brandName} logo`}
            fill
            className="object-contain p-1"
            sizes="200px"
          />
        </div>
      ) : (
        <span className="relative z-10 font-display text-2xl font-bold text-white drop-shadow-sm">{brandName}</span>
      )}
    </div>
  )
}
