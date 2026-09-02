import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function BrandLogo({
  href = "/",
  className,
  heightClassName = "h-8",
}: {
  href?: string | null
  className?: string
  imgClassName?: string
  height?: number
  heightClassName?: string
}) {
  const mark = (
    <span className={cn("inline-flex items-center", heightClassName)}>
      <Image
        src="/images/distro-source-logo.png"
        alt="DistroSource — Digital Products. Endless Possibilities."
        width={2172}
        height={724}
        loading="lazy"
        className="h-full w-auto max-w-[min(46vw,270px)] object-contain object-left dark:hidden"
      />
      <Image
        src="/images/distro-source-logo-dark.png"
        alt="DistroSource — Digital Products. Endless Possibilities."
        width={2172}
        height={724}
        loading="lazy"
        aria-hidden="true"
        className="hidden h-full w-auto max-w-[min(46vw,270px)] object-contain object-left dark:block"
      />
    </span>
  )

  if (href === null) {
    return <span className={cn("inline-flex items-center", className)}>{mark}</span>
  }

  return (
    <Link href={href} className={cn("inline-flex items-center", className)} aria-label="DistroSource home">
      {mark}
    </Link>
  )
}
