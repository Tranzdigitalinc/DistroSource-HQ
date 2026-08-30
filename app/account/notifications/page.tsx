import { Bell, Tag, Package, Megaphone } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export const metadata = {
  title: "Notifications — RedeemCove",
}

const preferences = [
  { id: "order-updates", icon: Package, label: "Order updates", description: "Delivery confirmations and code reveals.", defaultChecked: true },
  { id: "deals", icon: Tag, label: "Deals & discounts", description: "New promotions on your favorite brands.", defaultChecked: true },
  { id: "product-news", icon: Megaphone, label: "Product news", description: "New brands and categories added to RedeemCove.", defaultChecked: false },
  { id: "account-alerts", icon: Bell, label: "Account alerts", description: "Sign-in activity and security notices.", defaultChecked: true },
]

export default function AccountNotificationsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="font-display text-lg font-semibold">Notifications</h2>
        <p className="text-sm text-muted-foreground">Choose what RedeemCove keeps you posted about.</p>
      </div>

      <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
        {preferences.map((pref) => (
          <div key={pref.id} className="flex items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <pref.icon className="size-4.5" aria-hidden="true" />
              </span>
              <div>
                <Label htmlFor={pref.id} className="text-sm font-semibold">
                  {pref.label}
                </Label>
                <p className="text-sm text-muted-foreground">{pref.description}</p>
              </div>
            </div>
            <Switch id={pref.id} defaultChecked={pref.defaultChecked} />
          </div>
        ))}
      </div>
    </div>
  )
}
