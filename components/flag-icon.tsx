import { cn } from "@/lib/utils"

export function FlagIcon({
  code,
  className,
}: {
  code: string | null | undefined
  className?: string
}) {
  if (!code) return null

  return (
    <img
      src={`https://flagcdn.com/${code.toLowerCase()}.svg`}
      alt=""
      className={cn("inline-block h-3 w-4 shrink-0 rounded-[2px] object-cover ring-1 ring-white/10", className)}
      loading="lazy"
    />
  )
}
