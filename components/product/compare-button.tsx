"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { GitCompareArrows } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CompareButton({ productId }: { productId: number }) {
  const router = useRouter()
  const params = useSearchParams()
  const ids = (params.get("compare") ?? "").split(",").filter(Boolean).map(Number).filter(Number.isFinite)
  const selected = ids.includes(productId)

  function toggle() {
    const next = selected ? ids.filter((id) => id !== productId) : [...ids, productId].slice(-4)
    const query = next.length ? `?compare=${next.join(",")}` : ""
    router.push(`/compare${query}`)
  }

  return (
    <Button type="button" variant={selected ? "secondary" : "outline"} size="sm" onClick={toggle}>
      <GitCompareArrows data-icon="inline-start" />
      {selected ? "Compared" : "Compare"}
    </Button>
  )
}
