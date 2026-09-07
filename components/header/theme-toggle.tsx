"use client"

import { useSyncExternalStore } from "react"
import { useTheme } from "next-themes"
import { Moon, Sun } from "@/lib/storefront-icons"

const noop = () => () => {}

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  // false on the server and during hydration, true after — without an effect.
  const mounted = useSyncExternalStore(noop, () => true, () => false)

  const isDark = mounted ? resolvedTheme === "dark" : false

  return (
    <button
      type="button"
      className={
        className ??
        "hidden size-10 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:inline-flex"
      }
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
    </button>
  )
}
