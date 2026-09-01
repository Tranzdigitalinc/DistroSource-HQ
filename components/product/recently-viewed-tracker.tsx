"use client"

import { useEffect } from "react"
import { recordRecentlyViewed } from "@/lib/actions/recently-viewed"

export function RecentlyViewedTracker({ productId }: { productId: number }) {
  useEffect(() => {
    void recordRecentlyViewed(productId)
  }, [productId])
  return null
}
