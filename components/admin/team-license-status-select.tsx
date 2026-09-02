"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateTeamLicenseRequestStatus } from "@/lib/actions/admin-team-licensing"

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  contacted: "Contacted",
  closed: "Closed",
}

export function TeamLicenseStatusSelect({ requestId, status }: { requestId: number; status: string }) {
  const [value, setValue] = useState(status)
  const [isPending, startTransition] = useTransition()

  function handleChange(next: string | null) {
    if (!next) return
    setValue(next)
    startTransition(async () => {
      try {
        await updateTeamLicenseRequestStatus(requestId, next as "pending" | "contacted" | "closed")
      } catch {
        setValue(status)
        toast.error("Could not update this request.")
      }
    })
  }

  return (
    <Select value={value} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className="w-36">
        <SelectValue placeholder="Status">{(v: string | null) => STATUS_LABELS[v ?? ""] ?? "Status"}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pending">Pending</SelectItem>
        <SelectItem value="contacted">Contacted</SelectItem>
        <SelectItem value="closed">Closed</SelectItem>
      </SelectContent>
    </Select>
  )
}
