"use client"

import { Check, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FlagIcon } from "@/components/flag-icon"
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
        <FlagIcon code={selected?.code} className="h-3.5 w-5" />
        <span className="hidden sm:inline">{selected?.currencyCode}</span>
        <ChevronDown className="size-3.5 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-80 w-60">
        {countries.map((country) => (
          <DropdownMenuItem key={country.code} onClick={() => setSelectedCode(country.code)}>
            <FlagIcon code={country.code} className="h-3.5 w-5" />
            <span className="flex-1">{country.name}</span>
            <span className="text-xs text-muted-foreground">{country.currencyCode}</span>
            {selected?.code === country.code && <Check className="size-3.5 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
