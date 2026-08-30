"use client"

import { ChevronDown, Globe } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCurrency } from "@/lib/currency-context"

export function CountrySelector() {
  const { countries, selected, setSelectedCode } = useCurrency()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground"
          />
        }
      >
        <Globe className="size-4" />
        <span className="hidden sm:inline">
          {selected?.flagEmoji} {selected?.currencyCode}
        </span>
        <ChevronDown className="size-3.5 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-80 w-56">
        {countries.map((country) => (
          <DropdownMenuItem key={country.code} onClick={() => setSelectedCode(country.code)}>
            <span className="text-base">{country.flagEmoji}</span>
            <span className="flex-1">{country.name}</span>
            <span className="text-xs text-muted-foreground">{country.currencyCode}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
