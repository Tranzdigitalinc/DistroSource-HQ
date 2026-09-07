"use client"

import { SearchTrigger } from "@/components/header/search-command"

/**
 * Kept for call-site compatibility (hero, 404). Search itself now lives in
 * the global command dialog; this renders the trigger that opens it.
 */
export function HeaderSearch({ className, size = "default" }: { className?: string; size?: "default" | "lg" }) {
  return <SearchTrigger className={className} size={size} />
}
