import { Marquee } from "@/components/motion/marquee"
import { Download, Lock, Refresh, ShieldCheck, Sparkles } from "@/lib/storefront-icons"

// Only claims the storefront can back today.
const items = [
  { icon: Download, text: "Instant delivery after payment" },
  { icon: ShieldCheck, text: "Licence stated on every product" },
  { icon: Refresh, text: "Re-download anytime from My Library" },
  { icon: Lock, text: "Secure checkout — Polar, TamPay or Card2Crypto" },
  { icon: Sparkles, text: "New products every week" },
]

/** Thin navy strip above the header: a slow marquee of the store's promises. */
export function AnnouncementBar() {
  return (
    <div className="relative z-40 hidden h-9 items-center overflow-hidden bg-navy text-navy-foreground md:flex">
      <Marquee duration={48} gap="3rem" className="w-full">
        {items.map((item) => (
          <span key={item.text} className="flex items-center gap-2 whitespace-nowrap font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-navy-foreground/80">
            <item.icon size={13} className="text-primary" aria-hidden="true" />
            {item.text}
          </span>
        ))}
      </Marquee>
    </div>
  )
}
