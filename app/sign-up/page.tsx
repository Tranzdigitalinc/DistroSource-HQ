import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { AuthForm } from "@/components/auth/auth-form"
import { AuthShell } from "@/components/auth/auth-shell"

export const metadata = {
  title: "Create account — DistroSource",
}

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
    <AuthShell
      title="Create your DistroSource account"
      subtitle="Keep your purchases, downloads, licences and saved products in one place."
    >
      <AuthForm mode="sign-up" redirectTo={redirectTo} />
    </AuthShell>
  )
}
