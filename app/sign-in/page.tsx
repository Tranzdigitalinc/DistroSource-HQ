import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { AuthForm } from "@/components/auth/auth-form"
import { AuthShell } from "@/components/auth/auth-shell"

export default async function SignInPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect("/account")

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to view your orders, codes, and wishlist.">
      <AuthForm mode="sign-in" />
    </AuthShell>
  )
}
