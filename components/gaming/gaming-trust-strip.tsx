import { Download, Lock, RefreshCw, Support, ICON_SIZE } from "@/lib/storefront-icons"

// Four statements the Gaming department can actually stand behind. Nothing
// here promises a response time or a guarantee that is not in the policies.
const items = [
  { icon: Lock, title: "Secure Checkout", body: "Card payments handled on Tebex's hosted checkout." },
  { icon: Download, title: "Instant Digital Access", body: "Files are available as soon as payment clears." },
  { icon: RefreshCw, title: "Regular Product Updates", body: "Updates to a product are included with your purchase." },
  { icon: Support, title: "DistroSource Support", body: "Installation and compatibility help direct from us." },
]

export function GamingTrustStrip() {
  return (
    <section className="border-y border-border bg-secondary/30">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.title} className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary text-foreground">
                <item.icon size={ICON_SIZE.base} aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">Gaming payments powered by Tebex.</p>
      </div>
    </section>
  )
}
