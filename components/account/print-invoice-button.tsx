"use client"

import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PrintInvoiceButton() {
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className="bg-transparent print:hidden"
      onClick={() => window.print()}
    >
      <Printer className="size-3.5" aria-hidden="true" />
      Print invoice
    </Button>
  )
}
