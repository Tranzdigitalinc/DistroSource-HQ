import { getNotificationPreferences } from "@/lib/actions/account"
import { NotificationPreferencesForm } from "@/components/account/notification-preferences-form"

export const metadata = {
  title: "Notifications — RedeemCove",
}

export default async function AccountNotificationsPage() {
  const preferences = await getNotificationPreferences()

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="font-display text-lg font-semibold">Notifications</h2>
        <p className="text-sm text-muted-foreground">Choose what RedeemCove keeps you posted about.</p>
      </div>

      <NotificationPreferencesForm initialPreferences={preferences} />
    </div>
  )
}
