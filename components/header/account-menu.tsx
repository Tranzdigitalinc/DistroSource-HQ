"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { User, Package, Heart, Settings, LifeBuoy, LogOut, LogIn } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useSession, signOut } from "@/lib/auth-client"

export function AccountMenu() {
  const { data: session, isPending } = useSession()
  const router = useRouter()

  if (isPending) {
    return <div className="size-10 animate-pulse rounded-full bg-secondary" />
  }

  if (!session?.user) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="group size-10 rounded-full border border-transparent transition-all hover:border-accent/30 hover:bg-accent/10 hover:text-accent"
        nativeButton={false}
        render={<Link href="/sign-in" aria-label="Sign in" />}
      >
        <LogIn className="transition-transform duration-200 group-hover:scale-110" />
      </Button>
    )
  }

  async function handleSignOut() {
    await signOut()
    router.push("/")
    router.refresh()
  }

  const initials = session.user.name
    ? session.user.name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label="Open account menu"
            className="flex size-10 items-center justify-center rounded-full border-2 border-background bg-primary text-xs font-bold text-primary-foreground shadow-md shadow-primary/25 ring-1 ring-primary/35 transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/30"
          />
        }
      >
        {initials}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 py-1.5">
            <p className="text-sm font-medium text-foreground">{session.user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{session.user.email}</p>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link href="/account" />}>
            <User data-icon="inline-start" />
            Account overview
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/account/orders" />}>
            <Package data-icon="inline-start" />
            My orders
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/account/wishlist" />}>
            <Heart data-icon="inline-start" />
            Wishlist
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/account/settings" />}>
            <Settings data-icon="inline-start" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/account/support" />}>
            <LifeBuoy data-icon="inline-start" />
            Support
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
          <LogOut data-icon="inline-start" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
