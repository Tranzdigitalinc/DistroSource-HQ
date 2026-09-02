import Image from "next/image"
import { cn } from "@/lib/utils"

/**
 * Branded product thumbnail: a warm paper-toned card with the brand's real
 * logo resting on it, and a soft out-of-focus glow of the brand's signature
 * color in the corner for identity — never a flat, full-bleed brand-color
 * fill. Falls back to a neutral card background if the brand has no logo.
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
    <div className={cn("relative flex size-full items-center justify-center overflow-hidden bg-muted", className)}>
      {/* soft, out-of-focus brand-color glow — identity without a flat fill */}
      {brandColor && (
        <div
          className="absolute -right-6 -top-10 size-2/3 rounded-full opacity-50 blur-2xl"
          style={{ backgroundColor: brandColor }}
          aria-hidden="true"
        />
      )}
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-multiply"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "14px 14px",
        }}
        aria-hidden="true"
      />
      {logoUrl ? (
        <div
          className={cn(
            "relative z-10 flex aspect-square w-[42%] max-w-28 items-center justify-center rounded-xl border border-border/60 bg-card p-[11%] shadow-sm",
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
        <span className="relative z-10 px-4 text-center font-display text-xl font-semibold text-foreground">
          {brandName}
        </span>
      )}
    </div>
  )
}
