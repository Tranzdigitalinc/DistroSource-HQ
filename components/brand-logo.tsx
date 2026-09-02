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
    <span className={cn("inline-flex items-center gap-2.5", heightClassName)}>
      <span className="relative flex aspect-square h-full shrink-0 items-center justify-center rounded-[4px] bg-foreground text-background">
        <span className="font-mono text-[0.55em] font-bold leading-none">DS</span>
        <span className="absolute -bottom-[3px] -right-[3px] size-[28%] rounded-[2px] bg-primary" aria-hidden="true" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.05em] font-black tracking-tight text-foreground">
          Distro<span className="text-primary">Source</span>
        </span>
        <span className="hidden font-mono text-[0.28em] font-semibold uppercase tracking-[0.24em] text-muted-foreground sm:block">
          Digital catalog
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
