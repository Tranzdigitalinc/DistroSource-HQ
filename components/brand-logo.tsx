import Link from "next/link"
import { Boxes } from "lucide-react"
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
    <span className={cn("inline-flex items-center gap-2", heightClassName)}>
      <span className="flex aspect-square h-full shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-primary text-primary-foreground shadow-sm shadow-accent/30">
        <Boxes className="h-[55%] w-[55%]" aria-hidden="true" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.05em] font-bold tracking-tight text-foreground">
          Distro<span className="text-accent">Source</span>
        </span>
      </span>
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
