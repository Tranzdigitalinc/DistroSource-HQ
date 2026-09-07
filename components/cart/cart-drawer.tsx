"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useTransition } from "react"
import useSWR from "swr"
import { toast } from "sonner"
import { AnimatePresence, motion } from "motion/react"
import NumberFlow from "@number-flow/react"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { PriceDisplay } from "@/components/price-display"
import { CART_ITEMS_KEY, refreshCart, useCartDrawer } from "@/components/cart/cart-drawer-provider"
import { getCartItems, removeCartItem } from "@/lib/actions/cart"
import { getCartRecommendations } from "@/lib/actions/recommendations"
import { licenseLabel } from "@/lib/licenses"
import { ArrowRight, Close, Download, ImageOff, Loader2, Lock, Refresh, ShieldCheck, ShoppingBag, Trash, ICON_SIZE } from "@/lib/storefront-icons"
import { cn } from "@/lib/utils"

type CartItems = Awaited<ReturnType<typeof getCartItems>>
type Recs = Awaited<ReturnType<typeof getCartRecommendations>>

/**
 * Slide-over cart, tuned for conversion: what you just added, a live
 * subtotal, one unmistakable orange checkout button, the three promises
 * that matter at the moment of buying, and a short "goes well with" row so
 * the customer can add one more without leaving the drawer.
 */
export function CartDrawer() {
  const { open, setOpen } = useCartDrawer()
  const router = useRouter()
  const { data, isLoading } = useSWR<CartItems>(open ? CART_ITEMS_KEY : null, () => getCartItems(), { revalidateOnFocus: false })
  const { data: recs } = useSWR<Recs>(open && data ? ["cart-recs", data.map((i) => i.product.id).join(",")] : null, () => getCartRecommendations(4), {
    revalidateOnFocus: false,
  })

  useEffect(() => {
    if (open) void refreshCart()
  }, [open])

  const items = data ?? []
  const subtotal = items.reduce((sum, i) => sum + Number.parseFloat(i.license.price) * i.cartItem.quantity, 0)
  const count = items.reduce((sum, i) => sum + i.cartItem.quantity, 0)
  const close = () => setOpen(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" showCloseButton={false} className="w-full gap-0 border-l border-border bg-background p-0 text-foreground sm:max-w-[26rem]">
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <SheetTitle className="flex items-center gap-2.5 font-display text-lg font-bold tracking-tight">
            <ShoppingBag size={ICON_SIZE.nav} weight="bold" aria-hidden="true" />
            Your cart
            <AnimatePresence initial={false}>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  className="rounded-full bg-secondary px-2 font-mono text-[11px] font-semibold leading-5 text-muted-foreground"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </SheetTitle>
          <button
            type="button"
            onClick={close}
            aria-label="Close cart"
            className="flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Close size={ICON_SIZE.base} weight="bold" aria-hidden="true" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {isLoading && !data ? (
            <div className="flex flex-col gap-4 p-5">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="aspect-[16/10] w-24 animate-pulse rounded-xl bg-secondary" />
                  <div className="flex flex-1 flex-col gap-2 pt-1">
                    <div className="h-3.5 w-3/4 animate-pulse rounded bg-secondary" />
                    <div className="h-3 w-1/3 animate-pulse rounded bg-secondary" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-5 px-8 pb-8 pt-16 text-center">
              <span className="flex size-16 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                <ShoppingBag size={28} weight="duotone" aria-hidden="true" />
              </span>
              <div>
                <p className="font-display text-xl font-bold tracking-tight">Your cart is empty</p>
                <p className="mt-1.5 text-sm text-muted-foreground">Anything you add stays here until checkout.</p>
              </div>
              <Link href="/products" onClick={close} className="inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-semibold text-background transition-colors hover:bg-primary hover:text-primary-foreground">
                Browse products
                <ArrowRight size={ICON_SIZE.sm} weight="bold" aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col divide-y divide-border px-5">
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <DrawerLine
                    key={item.cartItem.id}
                    id={item.cartItem.id}
                    slug={item.product.slug}
                    name={item.product.name}
                    licenseType={item.license.licenseType}
                    price={Number.parseFloat(item.license.price) * item.cartItem.quantity}
                    quantity={item.cartItem.quantity}
                    image={item.imageUrl}
                    onNavigate={close}
                    onRemoved={() => router.refresh()}
                  />
                ))}
              </AnimatePresence>
            </ul>
          )}

          {recs && recs.length > 0 && (
            <div className="border-t border-border px-5 py-5">
              <p className="eyebrow">{items.length > 0 ? "Goes well with" : "Popular right now"}</p>
              <ul className="mt-3 flex flex-col gap-2">
                {recs.map((rec, i) => (
                  <RecommendationRow key={rec.product.id} rec={rec} onNavigate={close} highlight={i === 0 && items.length > 0} />
                ))}
              </ul>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border bg-card px-5 pb-5 pt-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <Subtotal amount={subtotal} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">One-time payment. Tax, if any, shown at checkout.</p>
            <Link
              href="/checkout"
              onClick={close}
              className="group mt-4 flex h-13 w-full items-center justify-center gap-2 rounded-full bg-primary text-[15px] font-semibold text-primary-foreground shadow-[0_10px_30px_-10px_var(--primary)] transition-[transform,box-shadow] hover:shadow-[0_14px_36px_-10px_var(--primary)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Lock size={ICON_SIZE.sm} weight="bold" aria-hidden="true" />
              Checkout securely
              <ArrowRight size={ICON_SIZE.sm} weight="bold" className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
            <div className="mt-2 flex items-center justify-between">
              <Link href="/cart" onClick={close} className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                View full cart
              </Link>
              <button type="button" onClick={close} className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                Keep shopping
              </button>
            </div>
            <ul className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
              {[
                [Download, "Instant delivery"],
                [ShieldCheck, "Licence stated"],
                [Refresh, "Re-download anytime"],
              ].map(([Icon, label]) => {
                const I = Icon as typeof Download
                return (
                  <li key={label as string} className="flex items-center gap-1.5">
                    <I size={13} weight="duotone" className="shrink-0 text-primary" aria-hidden="true" />
                    <span className="leading-tight">{label as string}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

function Subtotal({ amount }: { amount: number }) {
  return (
    <NumberFlow
      value={amount}
      format={{ style: "currency", currency: "USD", maximumFractionDigits: 2 }}
      className="font-display text-2xl font-bold tabular-nums tracking-tight"
    />
  )
}

function RecommendationRow({ rec, onNavigate, highlight = false }: { rec: Recs[number]; onNavigate: () => void; highlight?: boolean }) {
  const [isPending, startTransition] = useTransition()
  const image = rec.product.coverImageUrl ?? rec.images[0]?.url ?? rec.product.thumbnailUrl ?? null
  const cheapest = rec.licenses.length ? rec.licenses.reduce((m, l) => (Number.parseFloat(l.price) < Number.parseFloat(m.price) ? l : m), rec.licenses[0]) : null

  function add() {
    if (!cheapest) return
    startTransition(async () => {
      try {
        const { addToCart } = await import("@/lib/actions/cart")
        await addToCart(rec.product.id, cheapest.id, 1)
        await refreshCart()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't add that. Please try again.")
      }
    })
  }

  return (
    <li className={cn("relative flex items-center gap-3 rounded-xl border p-2 transition-colors hover:border-border-strong", highlight ? "border-primary/40 bg-primary/[0.04]" : "border-border")}>
      {highlight && <span className="absolute -top-2 left-3 rounded-full bg-primary px-2 font-mono text-[9px] font-bold uppercase leading-4 tracking-[0.08em] text-primary-foreground">Completes the set</span>}
      <Link href={`/products/${rec.product.slug}`} onClick={onNavigate} className="relative aspect-[16/10] w-20 shrink-0 overflow-hidden rounded-lg bg-secondary/60">
        {image && <Image src={image} alt="" fill sizes="80px" className="object-cover" />}
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={`/products/${rec.product.slug}`} onClick={onNavigate} className="line-clamp-1 text-[13px] font-semibold hover:text-primary">
          {rec.product.name}
        </Link>
        <p className="text-xs text-muted-foreground">
          {rec.product.isFree ? "Free" : <PriceDisplay usdAmount={rec.startingPrice} />}
        </p>
      </div>
      {cheapest && !rec.product.isFree && (
        <button
          type="button"
          onClick={add}
          disabled={isPending}
          aria-label={`Add ${rec.product.name} to cart`}
          className="flex h-8 shrink-0 items-center gap-1 rounded-full border border-border px-2.5 text-xs font-semibold transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground disabled:opacity-60"
        >
          {isPending ? <Loader2 size={12} className="animate-spin" aria-hidden="true" /> : "+ Add"}
        </button>
      )}
    </li>
  )
}

function DrawerLine({
  id,
  slug,
  name,
  licenseType,
  price,
  quantity,
  image,
  onNavigate,
  onRemoved,
}: {
  id: number
  slug: string
  name: string
  licenseType: string
  price: number
  quantity: number
  image: string | null
  onNavigate: () => void
  onRemoved: () => void
}) {
  const [isPending, startTransition] = useTransition()

  function remove() {
    startTransition(async () => {
      try {
        await removeCartItem(id)
        await refreshCart()
        onRemoved()
      } catch {
        toast.error("Couldn't remove that item. Please try again.")
      }
    })
  }

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -22, scale: 0.96 }}
      animate={{ opacity: isPending ? 0.5 : 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 420, damping: 22 }}
      className="flex gap-4 py-4"
    >
      <Link href={`/products/${slug}`} onClick={onNavigate} className="relative aspect-[16/10] w-24 shrink-0 overflow-hidden rounded-xl border border-border bg-secondary/60">
        {image ? (
          <Image src={image} alt="" fill sizes="96px" className="object-cover" />
        ) : (
          <span className="flex h-full items-center justify-center text-muted-foreground/60">
            <ImageOff size={ICON_SIZE.base} aria-hidden="true" />
          </span>
        )}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <Link href={`/products/${slug}`} onClick={onNavigate} className="line-clamp-2 text-sm font-semibold leading-snug text-foreground hover:text-primary">
          {name}
        </Link>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {licenseLabel(licenseType)} licence{quantity > 1 ? ` × ${quantity}` : ""}
        </p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <PriceDisplay usdAmount={price} className="font-display text-[15px] font-bold tabular-nums" />
          <button
            type="button"
            onClick={remove}
            disabled={isPending}
            aria-label={`Remove ${name} from cart`}
            className={cn(
              "flex h-7 items-center gap-1 rounded-full px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            {isPending ? <Loader2 size={13} className="animate-spin" aria-hidden="true" /> : <Trash size={13} aria-hidden="true" />}
            Remove
          </button>
        </div>
      </div>
    </motion.li>
  )
}
