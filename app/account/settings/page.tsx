import { getSession } from "@/lib/session"
import { ProfileSettingsForm } from "@/components/account/profile-settings-form"

export const metadata = {
  title: "Profile settings — DistroSource",
}

export default async function AccountSettingsPage() {
  const session = await getSession()
  const user = session!.user

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="font-display text-lg font-semibold">Profile settings</h2>
        <p className="text-sm text-muted-foreground">Update your display name and account details.</p>
      </div>
      <ProfileSettingsForm initialName={user.name} email={user.email} />
    </div>
  )
}
