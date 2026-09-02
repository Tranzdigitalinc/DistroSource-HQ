import { ChangePasswordForm } from "@/components/account/change-password-form"

export const metadata = {
  title: "Security — RedeemCove",
}

export default function AccountSecurityPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="font-display text-lg font-semibold">Security</h2>
        <p className="text-sm text-muted-foreground">
          Change your password. Updating your password signs you out of other devices.
        </p>
      </div>
      <ChangePasswordForm />
    </div>
  )
}
