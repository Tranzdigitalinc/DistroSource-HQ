"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Timer, ArrowRight } from "lucide-react"

function getNextMonday(): number {
  const now = new Date()
  const next = new Date(now)
  const daysUntilMonday = (8 - now.getDay()) % 7 || 7
  next.setDate(now.getDate() + daysUntilMonday)
  next.setHours(0, 0, 0, 0)
  return next.getTime()
}

function useCountdown(target: number) {
  const [remaining, setRemaining] = useState<number | null>(null)

  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, target - Date.now()))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [target])

  return remaining
}

function pad(n: number) {
  return n.toString().padStart(2, "0")
}

export function CountdownBanner() {
  const [target, setTarget] = useState<number | null>(null)
  useEffect(() => setTarget(getNextMonday()), [])
  const remaining = useCountdown(target ?? 0)

  if (remaining === null || target === null) return null

  const days = Math.floor(remaining / 86_400_000)
  const hours = Math.floor((remaining % 86_400_000) / 3_600_000)
  const minutes = Math.floor((remaining % 3_600_000) / 60_000)
  const seconds = Math.floor((remaining % 60_000) / 1000)

  return (
    <Link
      href="/deals"
      className="group flex items-center justify-center gap-3 bg-foreground px-4 py-2 text-background transition-colors hover:bg-foreground/90"
    >
      <Timer className="size-3.5 shrink-0 text-accent" />
      <span className="text-xs font-medium sm:text-sm">
        This week&apos;s deals end in{" "}
        <span className="font-display font-semibold tabular-nums">
          {days > 0 && `${days}d `}
          {pad(hours)}:{pad(minutes)}:{pad(seconds)}
        </span>
      </span>
      <span className="hidden items-center gap-1 text-xs font-semibold underline-offset-2 group-hover:underline sm:flex">
        Shop deals
        <ArrowRight className="size-3" />
      </span>
    </Link>
  )
}
