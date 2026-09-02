"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Bell, Tag, Package, Megaphone } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { updateNotificationPreference } from "@/lib/actions/account"

type PreferenceKey = "orderUpdates" | "deals" | "productNews" | "accountAlerts"

const preferenceMeta: Record<PreferenceKey, { icon: typeof Bell; label: string; description: string }> = {
  orderUpdates: { icon: Package, label: "Order updates", description: "Delivery confirmations and code reveals." },
  deals: { icon: Tag, label: "Deals & discounts", description: "New promotions on your favorite brands." },
  productNews: {
    icon: Megaphone,
    label: "Product news",
    description: "New brands and categories added to RedeemCove.",
  },
  accountAlerts: { icon: Bell, label: "Account alerts", description: "Sign-in activity and security notices." },
}

const order: PreferenceKey[] = ["orderUpdates", "deals", "productNews", "accountAlerts"]

export function NotificationPreferencesForm({
  initialPreferences,
}: {
  initialPreferences: Record<PreferenceKey, boolean>
}) {
  const [preferences, setPreferences] = useState(initialPreferences)
  const [savingKey, setSavingKey] = useState<PreferenceKey | null>(null)

  async function handleToggle(key: PreferenceKey, value: boolean) {
    const previous = preferences[key]
    setPreferences((prev) => ({ ...prev, [key]: value }))
    setSavingKey(key)

    try {
      await updateNotificationPreference(key, value)
    } catch (error) {
      setPreferences((prev) => ({ ...prev, [key]: previous }))
      toast.error(error instanceof Error ? error.message : "Could not save your preference. Please try again.")
    } finally {
      setSavingKey(null)
    }
  }

  return (
    <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
      {order.map((key) => {
        const meta = preferenceMeta[key]
        return (
          <div key={key} className="flex items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <meta.icon className="size-4.5" aria-hidden="true" />
              </span>
              <div>
                <Label htmlFor={key} className="text-sm font-semibold">
                  {meta.label}
                </Label>
                <p className="text-sm text-muted-foreground">{meta.description}</p>
              </div>
            </div>
            <Switch
              id={key}
              checked={preferences[key]}
              disabled={savingKey === key}
              onCheckedChange={(checked) => handleToggle(key, checked)}
            />
          </div>
        )
      })}
    </div>
  )
}
