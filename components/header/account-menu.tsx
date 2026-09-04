"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { User, Package, Heart, Library, Settings, LifeBuoy, LogOut, ICON_SIZE } from "@/lib/storefront-icons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSession, signOut } from "@/lib/auth-client"

const triggerClass =
  "flex h-10 items-center gap-2 rounded-md px-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

export function AccountMenu() {
  const { data: session, isPending } = useSession()
  const router = useRouter()

  if (isPending) {
    return <div className="h-10 w-10 animate-pulse rounded-md bg-secondary xl:w-24" aria-hidden="true" />
  }

  if (!session?.user) {
    return (
      <Link href="/sign-in" className={triggerClass}>
        <User size={ICON_SIZE.nav} aria-hidden="true" />
        <span className="hidden xl:inline">Sign in</span>
      </Link>
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
      <DropdownMenuTrigger render={<button type="button" aria-label="Account menu" className={triggerClass} />}>
        <span className="flex size-7 items-center justify-center rounded-full bg-navy font-mono text-[11px] font-bold text-navy-foreground" aria-hidden="true">
          {initials}
        </span>
        <span className="hidden xl:inline">Account</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 rounded-lg">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 py-1.5">
            <p className="text-sm font-semibold text-foreground">{session.user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{session.user.email}</p>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link href="/account" />}>
            <User data-icon="inline-start" />
            Overview
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/account/library" />}>
            <Library data-icon="inline-start" />
            My Library
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/account/orders" />}>
            <Package data-icon="inline-start" />
            Orders
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
