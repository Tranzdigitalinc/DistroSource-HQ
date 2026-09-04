import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { AuthForm } from "@/components/auth/auth-form"
import { AuthShell } from "@/components/auth/auth-shell"

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; redirect?: string }>
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  const params = await searchParams
  const redirectTo = params.next || params.redirect || "/account"
  if (session?.user) redirect(redirectTo)

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to view your orders, downloads, licenses, and wishlist.">
      <AuthForm mode="sign-in" redirectTo={redirectTo} />
    </AuthShell>
  )
}
