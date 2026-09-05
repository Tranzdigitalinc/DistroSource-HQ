"use client"

import { createContext, useCallback, useContext, useMemo, useState, useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { PriceDisplay } from "@/components/price-display"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowRight, ImageOff, Loader2, Lock, ShoppingBag, Trash, ICON_SIZE } from "@/lib/storefront-icons"
import { removeCartItem } from "@/lib/actions/cart"
import { licenseLabel } from "@/lib/licenses"
import { useCartSummary } from "@/lib/use-cart"

interface CartDrawerContextValue {
  open: boolean
  openCart: () => void
  closeCart: () => void
}

const CartDrawerContext = createContext<CartDrawerContextValue | null>(null)

/**
 * Lets any client component open the cart without prop-drilling — the header
 * trigger, and "Add to cart" everywhere in the catalog.
 *
 * Outside the provider the hook returns no-ops rather than throwing, so a
 * component that renders in isolation (a test, a Storybook-style page) does
 * not crash on a missing provider.
 */
export function useCartDrawer(): CartDrawerContextValue {
  return useContext(CartDrawerContext) ?? { open: false, openCart: () => {}, closeCart: () => {} }
}

export function CartDrawerProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const value = useMemo(
    () => ({ open, openCart: () => setOpen(true), closeCart: () => setOpen(false) }),
    [open],
  )

  return (
    <CartDrawerContext.Provider value={value}>
      {children}
      <CartDrawer open={open} onOpenChange={setOpen} />
    </CartDrawerContext.Provider>
  )
}

function CartDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter()
  const { items, count, subtotal, isLoading, refresh } = useCartSummary()
  const [removingId, setRemovingId] = useState<number | null>(null)
  const [, startRemove] = useTransition()

  const close = useCallback(() => onOpenChange(false), [onOpenChange])

  function handleRemove(cartItemId: number) {
    setRemovingId(cartItemId)
    startRemove(async () => {
      try {
        await removeCartItem(cartItemId)
        await refresh()
        router.refresh()
      } catch {
        toast.error("We couldn't remove this item. Please try again.")
      } finally {
        setRemovingId(null)
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/* The width classes carry the same data-[side=right] prefix as the
          sheet's own defaults (w-3/4 / sm:max-w-sm), otherwise those win and
          the drawer sits at 75% on a phone — too narrow for a line item. */}
      <SheetContent
        side="right"
        className="flex flex-col gap-0 p-0 data-[side=right]:w-[calc(100%-2.5rem)] data-[side=right]:sm:max-w-md"
      >
        <SheetHeader className="flex-row items-center justify-between border-b border-border px-5 py-4">
          <SheetTitle className="font-display text-base font-bold">
            Your cart
            {count > 0 && <span className="ml-2 text-sm font-medium text-muted-foreground">{count} {count === 1 ? "item" : "items"}</span>}
          </SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex flex-col gap-4 px-5 py-4" aria-busy="true">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="aspect-[4/3] w-20 rounded-md" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="mt-2 h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <ShoppingBag size={ICON_SIZE.feature} aria-hidden="true" />
            </span>
            <div>
              <p className="font-display text-lg font-bold text-foreground">Your cart is empty.</p>
              <p className="mt-1.5 text-sm text-muted-foreground">Anything you add is kept here until checkout.</p>
            </div>
            <Button render={<Link href="/products" onClick={close} />} nativeButton={false} className="font-semibold">
              Browse products
              <ArrowRight aria-hidden="true" />
            </Button>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-5">
              {items.map((item) => {
                const busy = removingId === item.cartItemId
                return (
                  <li key={item.cartItemId} className="grid grid-cols-[4.5rem_minmax(0,1fr)_auto] items-start gap-3 border-b border-border py-4 last:border-0">
                    <Link
                      href={`/products/${item.productSlug}`}
                      onClick={close}
                      className="relative aspect-[4/3] w-full overflow-hidden rounded-md border border-border bg-secondary/40"
                      aria-label={`View ${item.productName}`}
                    >
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt="" fill className="object-cover" sizes="72px" />
                      ) : (
                        <span className="flex size-full items-center justify-center text-muted-foreground">
                          <ImageOff size={ICON_SIZE.base} aria-hidden="true" />
                        </span>
                      )}
                    </Link>

                    <div className="min-w-0">
                      <Link
                        href={`/products/${item.productSlug}`}
                        onClick={close}
                        className="line-clamp-2 text-sm font-semibold leading-snug text-foreground hover:text-primary"
                      >
                        {item.productName}
                      </Link>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {licenseLabel(item.licenseType)} licence
                        {item.quantity > 1 ? ` × ${item.quantity}` : ""}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleRemove(item.cartItemId)}
                        disabled={busy}
                        className="mt-1.5 inline-flex h-8 items-center gap-1.5 rounded-md px-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {busy ? <Loader2 size={12} className="animate-spin" aria-hidden="true" /> : <Trash size={12} aria-hidden="true" />}
                        Remove
                      </button>
                    </div>

                    <PriceDisplay
                      usdAmount={Number.parseFloat(item.unitPriceUsd) * item.quantity}
                      className="text-sm font-semibold tabular-nums text-foreground"
                    />
                  </li>
                )
              })}
            </ul>

            <div className="border-t border-border px-5 py-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <PriceDisplay usdAmount={subtotal} className="font-display text-xl font-bold tabular-nums" />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Discounts and tax are applied at checkout.</p>

              <div className="mt-4 flex flex-col gap-2">
                <Button size="xl" render={<Link href="/checkout" onClick={close} />} nativeButton={false} className="w-full font-semibold">
                  <Lock size={ICON_SIZE.sm} aria-hidden="true" />
                  Checkout
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  render={<Link href="/cart" onClick={close} />}
                  nativeButton={false}
                  className="w-full bg-transparent font-semibold"
                >
                  View full cart
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
