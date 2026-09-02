"use client"

import { useState, useTransition } from "react"
import { Loader2, Plus } from "@/lib/admin-icons"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createAffiliateCode } from "@/lib/actions/affiliates"

export function CreateAffiliateDialog() {
  const [open, setOpen] = useState(false)
  const [partnerName, setPartnerName] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [commissionPercent, setCommissionPercent] = useState("5")
  const [isPending, startTransition] = useTransition()

  function handleCreate() {
    startTransition(async () => {
      try {
        const { code } = await createAffiliateCode({
          partnerName,
          contactEmail,
          commissionPercent: Number.parseFloat(commissionPercent) || 0,
        })
        toast.success(`Affiliate code ${code} created`)
        setOpen(false)
        setPartnerName("")
        setContactEmail("")
        setCommissionPercent("5")
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not create this affiliate code.")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button type="button" size="sm" />}>
        <Plus data-icon="inline-start" />
        New affiliate
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create affiliate code</DialogTitle>
          <DialogDescription>
            Generates a tracking code. Orders placed with `?aff=CODE` in the link are attributed to this partner.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="affiliate-partner">Partner name</Label>
            <Input id="affiliate-partner" value={partnerName} onChange={(e) => setPartnerName(e.target.value)} placeholder="e.g. CashbackHub" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="affiliate-email">Contact email (optional)</Label>
            <Input id="affiliate-email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="partner@example.com" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="affiliate-commission">Commission %</Label>
            <Input id="affiliate-commission" type="number" min="0" max="100" step="0.5" value={commissionPercent} onChange={(e) => setCommissionPercent(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
          <Button type="button" onClick={handleCreate} disabled={isPending || !partnerName.trim()}>
            {isPending ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : null}
            Create code
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
