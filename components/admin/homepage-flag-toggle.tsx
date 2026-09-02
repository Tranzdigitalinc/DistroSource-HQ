"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"
import { toggleHomepageFlag } from "@/lib/actions/admin-homepage"

export function HomepageFlagToggle({
  productId,
  flag,
  defaultChecked,
  label,
}: {
  productId: number
  flag: "isFeatured" | "isNewRelease"
  defaultChecked: boolean
  label: string
}) {
  const [checked, setChecked] = useState(defaultChecked)
  const [isPending, startTransition] = useTransition()

  function handleChange(value: boolean) {
    setChecked(value)
    startTransition(async () => {
      try {
        await toggleHomepageFlag(productId, flag, value)
      } catch {
        setChecked(!value)
        toast.error("Could not update this product.")
      }
    })
  }

  return (
    <label className="flex items-center gap-2 text-xs text-muted-foreground">
      <Checkbox checked={checked} onCheckedChange={(v) => handleChange(v === true)} disabled={isPending} />
      {label}
    </label>
  )
}
