"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Loader2, CheckCircle2 } from "@/lib/storefront-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { submitTeamLicenseRequest } from "@/lib/actions/account"

export function TeamLicensingForm() {
  const [isPending, startTransition] = useTransition()
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    const companyName = String(formData.get("companyName") ?? "")
    const contactName = String(formData.get("contactName") ?? "")
    const contactEmail = String(formData.get("contactEmail") ?? "")
    const productInterest = String(formData.get("productInterest") ?? "")
    const seatsEstimateRaw = String(formData.get("seatsEstimate") ?? "")
    const budgetUsdRaw = String(formData.get("budgetUsd") ?? "")
    const message = String(formData.get("message") ?? "")

    startTransition(async () => {
      try {
        await submitTeamLicenseRequest({
          companyName,
          contactName,
          contactEmail,
          productInterest: productInterest || undefined,
          seatsEstimate: seatsEstimateRaw ? Number(seatsEstimateRaw) : undefined,
          budgetUsd: budgetUsdRaw ? Number(budgetUsdRaw) : undefined,
          message: message || undefined,
        })
        setSubmitted(true)
        form.reset()
        toast.success("Request sent", { description: "We'll follow up by email. Typical response within 1 business day." })
      } catch {
        toast.error("Something went wrong. Please try again.")
      }
    })
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-10 text-center">
        <CheckCircle2 className="size-10 text-success" />
        <h2 className="font-display text-xl font-bold">Request received</h2>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          Thanks for reaching out. We&apos;ll reply by email to discuss agency and team licensing. Typical response
          within 1 business day.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-xl border border-border bg-card p-6 sm:p-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="companyName">Company name</Label>
          <Input id="companyName" name="companyName" required placeholder="Acme Studio" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contactName">Your name</Label>
          <Input id="contactName" name="contactName" required placeholder="Jane Doe" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contactEmail">Work email</Label>
          <Input id="contactEmail" name="contactEmail" type="email" required placeholder="jane@acme.com" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="seatsEstimate">Estimated seats</Label>
          <Input id="seatsEstimate" name="seatsEstimate" type="number" min={1} placeholder="10" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="productInterest">Products of interest</Label>
          <Input id="productInterest" name="productInterest" placeholder="Website templates, UI kits" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="budgetUsd">Estimated budget (USD)</Label>
          <Input id="budgetUsd" name="budgetUsd" type="number" min={0} placeholder="2500" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="message">Tell us about your team</Label>
        <Textarea
          id="message"
          name="message"
          rows={4}
          placeholder="What are you building, and how many people need access?"
        />
      </div>
      <Button type="submit" size="lg" disabled={isPending} className="w-full font-semibold sm:w-fit">
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Sending request
          </>
        ) : (
          "Request team licensing"
        )}
      </Button>
    </form>
  )
}
