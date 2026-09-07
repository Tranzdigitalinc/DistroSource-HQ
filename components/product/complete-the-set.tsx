"use client"

import Image from "next/image"
import Link from "next/link"
import { useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { motion } from "motion/react"
import { openCartDrawer, refreshCart } from "@/components/cart/cart-drawer-provider"
import { flyToCart } from "@/components/motion/fly-to-cart"
import { DrawnCheck } from "@/components/motion/cart-burst"
import { addToCart } from "@/lib/actions/cart"
import { formatUsd } from "@/lib/format"
import { Loader2, Plus, ShoppingBag, ICON_SIZE } from "@/lib/storefront-icons"
import { cn } from "@/lib/utils"

export interface SetItem {
  id: number
  slug: string
  name: string
  image: string | null
  licenseId: number
  price: number
}

/**
 * "Complete the set": the current product paired with one related product,
 * both added with a single tap. Shows the plain combined total — no invented
 * bundle discount.
 */
export function CompleteTheSet({ current, partner }: { current: SetItem; partner: SetItem }) {
  const router = useRouter()
  const imgRef = useRef<HTMLImageElement>(null)
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState(false)
  const total = current.price + partner.price

  function addBoth() {
    if (isPending) return
    const source = imgRef.current
    startTransition(async () => {
      try {
        await addToCart(current.id, current.licenseId, 1)
        await addToCart(partner.id, partner.licenseId, 1)
        await refreshCart()
        setDone(true)
        flyToCart(source)
        setTimeout(openCartDrawer, 520)
        router.refresh()
        setTimeout(() => setDone(false), 2000)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't add both. Please try again.")
      }
    })
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      aria-labelledby="complete-set-title"
      className="rounded-2xl border border-border bg-card p-4"
    >
      <p className="eyebrow">Complete the set</p>
      <h2 id="complete-set-title" className="mt-2 font-display text-base font-bold tracking-tight">Pairs well together</h2>

      <div className="mt-4 flex items-center gap-2">
        <Thumb item={current} ref={imgRef} />
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <Plus size={14} weight="bold" aria-hidden="true" />
        </span>
        <Thumb item={partner} link />
      </div>

      <ul className="mt-3 flex flex-col gap-1 text-xs text-muted-foreground">
        <li className="flex items-baseline justify-between gap-3">
          <span className="truncate text-foreground">{current.name}</span>
          <span className="shrink-0 tabular-nums">{formatUsd(current.price)}</span>
        </li>
        <li className="flex items-baseline justify-between gap-3">
          <Link href={`/products/${partner.slug}`} className="truncate text-foreground hover:text-primary">
            {partner.name}
          </Link>
          <span className="shrink-0 tabular-nums">{formatUsd(partner.price)}</span>
        </li>
      </ul>

      <button
        type="button"
        onClick={addBoth}
        disabled={isPending}
        className={cn(
          "mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold transition-[background-color,transform] active:scale-[0.98] disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          done ? "bg-success text-success-foreground" : "bg-foreground text-background hover:bg-primary hover:text-primary-foreground",
        )}
      >
        {isPending ? <Loader2 size={ICON_SIZE.sm} className="animate-spin" aria-hidden="true" /> : done ? <DrawnCheck size={16} /> : <ShoppingBag size={ICON_SIZE.sm} weight="bold" aria-hidden="true" />}
        {done ? "Both added" : `Add both · ${formatUsd(total)}`}
      </button>
    </motion.section>
  )
}

function Thumb({ item, link = false, ref }: { item: SetItem; link?: boolean; ref?: React.Ref<HTMLImageElement> }) {
  const inner = item.image ? <Image ref={ref} src={item.image} alt="" fill sizes="8rem" className="object-cover" /> : null
  const cls = "relative aspect-[16/10] min-w-0 flex-1 overflow-hidden rounded-xl border border-border bg-secondary/60"
  return link ? (
    <Link href={`/products/${item.slug}`} className={cls} aria-label={item.name}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  )
}
