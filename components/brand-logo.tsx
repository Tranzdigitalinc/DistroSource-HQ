"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function BrandLogo({
  href = "/",
  className,
  imgClassName,
  height = 28,
}: {
  href?: string | null
  className?: string
  imgClassName?: string
  height?: number
}) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted ? resolvedTheme === "dark" : true
  const src = isDark ? "/images/logos/redeemcove-logo-light-text.png" : "/images/logos/redeemcove-logo-dark-text.png"
  const [intrinsicWidth, intrinsicHeight] = isDark ? [2109, 358] : [2003, 343]

  const logo = (
    <Image
      key={src}
      src={src}
      alt="RedeemCove"
      width={intrinsicWidth}
      height={intrinsicHeight}
      priority
      className={cn("w-auto", imgClassName)}
      style={{ height }}
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
