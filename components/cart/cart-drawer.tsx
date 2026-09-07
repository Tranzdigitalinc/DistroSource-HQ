"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useTransition } from "react"
import useSWR from "swr"
import { toast } from "sonner"
import { AnimatePresence, motion } from "motion/react"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { PriceDisplay } from "@/components/price-display"
import { CART_ITEMS_KEY, refreshCart, useCartDrawer } from "@/components/cart/cart-drawer-provider"
import { getCartItems, removeCartItem } from "@/lib/actions/cart"
import { licenseLabel } from "@/lib/licenses"
import { ArrowRight, Close, ImageOff, Loader2, Lock, ShoppingBag, Trash, ICON_SIZE } from "@/lib/storefront-icons"
import { cn } from "@/lib/utils"

type CartItems = Awaited<ReturnType<typeof getCartItems>>

/**
 * Slide-over cart. Opens after every add-to-cart so the customer sees what
 * happened and can keep browsing or go straight to checkout. Line items are
 * the same server rows the cart page uses; removing one revalidates the
 * header badge and the page.
 */
export function CartDrawer() {
  const { open, setOpen } = useCartDrawer()
  const router = useRouter()
  const { data, isLoading } = useSWR<CartItems>(open ? CART_ITEMS_KEY : null, () => getCartItems(), { revalidateOnFocus: false })

  // Refresh once per open so the list is never stale after an add.
  useEffect(() => {
    if (open) void refreshCart()
  }, [open])

  const items = data ?? []
  const subtotal = items.reduce((sum, i) => sum + Number.parseFloat(i.license.price) * i.cartItem.quantity, 0)
  const count = items.reduce((sum, i) => sum + i.cartItem.quantity, 0)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full gap-0 border-l border-border bg-background p-0 text-foreground sm:max-w-md"
      >
        <div className="flex h-14 items-center justify-between border-b border-border px-5">
          <SheetTitle className="flex items-baseline gap-2 font-display text-base font-bold tracking-tight">
            Your cart
            {count > 0 && <span className="font-mono text-xs font-medium text-muted-foreground">{count} {count === 1 ? "item" : "items"}</span>}
          </SheetTitle>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close cart"
            className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Close size={ICON_SIZE.base} aria-hidden="true" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {isLoading && !data ? (
            <div className="flex flex-col gap-4 p-5">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="aspect-[16/10] w-24 animate-pulse rounded-lg bg-secondary" />
                  <div className="flex flex-1 flex-col gap-2 pt-1">
                    <div className="h-3.5 w-3/4 animate-pulse rounded bg-secondary" />
                    <div className="h-3 w-1/3 animate-pulse rounded bg-secondary" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 px-8 py-16 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                <ShoppingBag size={ICON_SIZE.feature} aria-hidden="true" />
              </span>
              <div>
                <p className="font-display text-lg font-bold">Your cart is empty</p>
                <p className="mt-1 text-sm text-muted-foreground">Anything you add stays here until checkout.</p>
              </div>
              <Button nativeButton={false} render={<Link href="/products" onClick={() => setOpen(false)} />} className="h-10 px-4 font-semibold">
                Browse products
                <ArrowRight size={ICON_SIZE.sm} aria-hidden="true" />
              </Button>
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
                    onNavigate={() => setOpen(false)}
                    onRemoved={() => router.refresh()}
                  />
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border bg-card px-5 py-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <PriceDisplay usdAmount={subtotal} className="font-display text-xl font-bold tabular-nums tracking-tight" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Tax, if any, is calculated at secure checkout.</p>
            <div className="mt-4 flex flex-col gap-2">
              <Button nativeButton={false} render={<Link href="/checkout" onClick={() => setOpen(false)} />} className="h-11 w-full font-semibold">
                <Lock size={ICON_SIZE.sm} aria-hidden="true" />
                Checkout
              </Button>
              <Button
                variant="outline"
                nativeButton={false}
                render={<Link href="/cart" onClick={() => setOpen(false)} />}
                className="h-10 w-full bg-transparent font-semibold"
              >
                View cart
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
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
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: isPending ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.18 }}
      className="flex gap-4 py-4"
    >
      <Link href={`/products/${slug}`} onClick={onNavigate} className="relative aspect-[16/10] w-24 shrink-0 overflow-hidden rounded-lg border border-border bg-secondary/60">
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
          <PriceDisplay usdAmount={price} className="text-sm font-semibold tabular-nums" />
          <button
            type="button"
            onClick={remove}
            disabled={isPending}
            aria-label={`Remove ${name} from cart`}
            className={cn(
              "flex h-7 items-center gap-1 rounded-md px-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
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
