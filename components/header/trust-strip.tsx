import { Download, Lock, RefreshCw, ICON_SIZE } from "@/lib/storefront-icons"

// Three statements the storefront can back today. No response-time
// guarantees, no "worldwide" claims that depend on Polar's country list.
// "Merchant of Record" is Polar-specific (it doesn't apply to TamPay) so
// this stays a generic security claim rather than naming one provider.
const items = [
  { icon: Download, label: "Instant delivery after payment" },
  { icon: Lock, label: "Secure checkout, multiple payment options" },
  { icon: RefreshCw, label: "Re-download anytime from My Library" },
]

export function TrustStrip() {
  return (
    <div className="hidden bg-navy lg:block">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-center gap-8 px-6">
        {items.map((item) => (
          <span key={item.label} className="flex items-center gap-2 text-xs font-medium text-navy-foreground/75">
            <item.icon size={ICON_SIZE.sm} className="text-primary" aria-hidden="true" />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  )
}
