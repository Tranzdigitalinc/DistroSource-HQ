"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"

export interface CurrencyCountry {
  code: string
  name: string
  flagEmoji: string | null
  currencyCode: string
  currencySymbol: string
  usdToLocalRate: string
}

interface CurrencyContextValue {
  countries: CurrencyCountry[]
  selected: CurrencyCountry | null
  setSelectedCode: (code: string) => void
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

const STORAGE_KEY = "redeemcove-display-currency"

export function CurrencyProvider({
  countries,
  children,
}: {
  countries: CurrencyCountry[]
  children: React.ReactNode
}) {
  const [selectedCode, setSelectedCodeState] = useState<string>("US")

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) setSelectedCodeState(stored)
  }, [])

  function setSelectedCode(code: string) {
    setSelectedCodeState(code)
    window.localStorage.setItem(STORAGE_KEY, code)
  }

  const selected = useMemo(
    () => countries.find((c) => c.code === selectedCode) ?? countries.find((c) => c.code === "US") ?? countries[0] ?? null,
    [countries, selectedCode],
  )

  return (
    <CurrencyContext.Provider value={{ countries, selected, setSelectedCode }}>{children}</CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider")
  return ctx
}
