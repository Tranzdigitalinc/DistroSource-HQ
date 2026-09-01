import Image from "next/image"
import { countryCodeToName } from "@/lib/user-agent"

/**
 * Renders a real flag image (via flagcdn.com) instead of a Unicode emoji flag.
 * Emoji regional-indicator flags don't render as flags on many desktop
 * platforms (Windows, some Linux builds) — they show blank boxes or letter
 * codes instead. A raster/vector image works identically everywhere.
 */
export function CountryFlag({
  code,
  className,
  size = 16,
}: {
  code: string | null | undefined
  className?: string
  size?: number
}) {
  if (!code || code.length !== 2) return null
  const lower = code.toLowerCase()
  const name = countryCodeToName(code)

  return (
    <Image
      src={`https://flagcdn.com/w40/${lower}.png`}
      alt={name}
      title={name}
      width={size}
      height={size}
      unoptimized
      className={`inline-block rounded-[2px] object-cover ${className ?? ""}`}
      style={{ width: size, height: Math.round(size * 0.75) }}
    />
  )
}
