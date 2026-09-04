import Link from "next/link"
import { notFound } from "next/navigation"
import { and, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { abandonedCarts } from "@/lib/db/schema"
import { Button } from "@/components/ui/button"

export default async function RecoverCartPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const [cart] = await db.select({ id: abandonedCarts.id, subtotalUsd: abandonedCarts.subtotalUsd, status: abandonedCarts.status }).from(abandonedCarts).where(and(eq(abandonedCarts.recoveryToken, token), eq(abandonedCarts.status, "open"))).limit(1)
  if (!cart) notFound()

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center gap-5 px-6 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Saved cart</p>
      <h1 className="font-display text-4xl font-bold text-balance">Your cart is waiting.</h1>
      <p className="max-w-md text-muted-foreground leading-relaxed">We saved your cart before checkout. Sign in to restore it to your account, or continue as a guest.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button
          render={
            <Link href={`/sign-in?redirect=${encodeURIComponent(`/api/cart/recover?token=${token}`)}`} />
          }
          nativeButton={false}
        >
          Sign in to restore
        </Button>
        <Button
          variant="outline"
          className="bg-transparent"
          render={<Link href={`/api/cart/recover?token=${encodeURIComponent(token)}`} />}
          nativeButton={false}
        >
          Continue as guest
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">Saved subtotal: ${Number.parseFloat(cart.subtotalUsd).toFixed(2)}</p>
    </main>
  )
}
