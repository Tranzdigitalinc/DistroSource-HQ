"use client"

import { useEffect, useRef } from "react"
import { confettiBurst } from "@/components/velora/confetti"

/** Fires a one-time confetti burst from the top of the viewport when an order confirmation mounts. */
export function OrderConfetti() {
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true
    confettiBurst({
      x: window.innerWidth / 2,
      y: window.innerHeight * 0.25,
      count: 130,
      colors: ["#b56a2e", "#c98a3e", "#d9a94f", "#8a6a4a", "#efe7d8"],
    })
  }, [])

  return null
}
