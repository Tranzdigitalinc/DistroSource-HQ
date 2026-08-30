import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { AuthForm } from "@/components/auth/auth-form"
import { AuthShell } from "@/components/auth/auth-shell"

export default async function SignUpPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect("/account")

  return (
    <AuthShell title="Create your account" subtitle="Join RedeemCove to buy, track, and manage your digital codes.">
      <AuthForm mode="sign-up" />
    </AuthShell>
  )
}
