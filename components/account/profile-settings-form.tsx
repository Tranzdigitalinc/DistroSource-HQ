"use client"

import { useState } from "react"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "@/lib/storefront-icons"

export function ProfileSettingsForm({ initialName, email }: { initialName: string; email: string }) {
  const [name, setName] = useState(initialName)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const result = await authClient.updateUser({ name })
    setLoading(false)

    if (result.error) {
      toast.error("Could not update your profile. Please try again.")
      return
    }
    toast.success("Profile updated")
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-5 rounded-xl border border-border bg-card p-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email address</Label>
        <Input id="email" value={email} disabled className="opacity-60" />
        <p className="text-xs text-muted-foreground">Contact support to change the email on your account.</p>
      </div>
      <Button type="submit" disabled={loading} className="self-start font-semibold">
        {loading && <Loader2 className="size-4 animate-spin" />}
        Save changes
      </Button>
    </form>
  )
}
