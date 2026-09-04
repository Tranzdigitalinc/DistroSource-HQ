"use client"

import { useSyncExternalStore } from "react"
import { useTheme } from "next-themes"
import { Moon, Sun } from "@/lib/storefront-icons"
import { Button } from "@/components/ui/button"

const noop = () => () => {}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  // false on the server and during hydration, true after — without an effect.
  const mounted = useSyncExternalStore(noop, () => true, () => false)

  const isDark = mounted ? resolvedTheme === "dark" : true

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="hidden size-9 shrink-0 text-muted-foreground hover:text-foreground sm:inline-flex"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
    </Button>
  )
}
