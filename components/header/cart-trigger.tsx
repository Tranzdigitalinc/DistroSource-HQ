"use client"

import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartCount } from "@/lib/use-cart"

export function CartTrigger() {
  const { count } = useCartCount()

  return (
    <Button
      variant="ghost"
      size="icon"
      className="group relative size-10 rounded-full border border-transparent transition-all hover:border-accent/30 hover:bg-accent/10 hover:text-accent"
      nativeButton={false}
      render={<Link href="/cart" aria-label={count > 0 ? `Cart, ${count} items` : "Cart"} />}
    >
      <ShoppingCart className="transition-transform duration-200 group-hover:-rotate-3 group-hover:scale-110" />
      {count > 0 && (
        <span
          aria-label={`${count} items in cart`}
          className="absolute -right-0.5 -top-0.5 flex min-w-5 items-center justify-center rounded-full border-2 border-background bg-accent px-1 text-[10px] font-bold leading-4 text-accent-foreground shadow-sm shadow-accent/30"
        >
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Button>
  )
}
