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
      className="relative"
      nativeButton={false}
      render={<Link href="/cart" aria-label="Cart" />}
    >
      <ShoppingCart />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex size-4.5 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-accent-foreground">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Button>
  )
}
