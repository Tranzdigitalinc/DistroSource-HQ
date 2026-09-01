import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

const BRAND_LOGO_SRC = "/images/logos/redeemcove-main-logo.png"

export function BrandLogo({
  href = "/",
  className,
  imgClassName,
  height = 28,
  heightClassName,
}: {
  href?: string | null
  className?: string
  imgClassName?: string
  height?: number
  /** Responsive Tailwind height classes (e.g. "h-8 sm:h-10"). When provided, these override the fixed `height` prop so the logo can shrink on small screens. */
  heightClassName?: string
}) {
  const logo = (
    <Image
      src={BRAND_LOGO_SRC}
      alt="RedeemCove — gift cards, digital codes, instant value"
      width={2048}
      height={576}
      priority
      unoptimized
      className={cn("w-auto", heightClassName, imgClassName)}
      style={heightClassName ? undefined : { height }}
    />
  )

  if (href === null) {
    return <span className={cn("inline-flex items-center", className)}>{logo}</span>
  }

  return (
    <Link href={href} className={cn("inline-flex items-center", className)}>
      {logo}
    </Link>
  )
}
