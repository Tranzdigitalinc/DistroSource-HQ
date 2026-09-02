import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { AuthForm } from "@/components/auth/auth-form"
import { AuthShell } from "@/components/auth/auth-shell"

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; redirect?: string }>
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  const params = await searchParams
  const redirectTo = params.next || params.redirect || "/account"
  if (session?.user) redirect(redirectTo)

  return (
    <AuthShell title="Create your account" subtitle="Join DistroSource to buy, download, and manage your digital products.">
      <AuthForm mode="sign-up" redirectTo={redirectTo} />
    </AuthShell>
  )
}
