import { Zap, ShieldCheck, Globe2, HeadphonesIcon } from "lucide-react"

const items = [
  { icon: Zap, label: "Instant download access" },
  { icon: ShieldCheck, label: "Encrypted, secure checkout" },
  { icon: Globe2, label: "Available worldwide" },
  { icon: HeadphonesIcon, label: "24/7 human support" },
]

export function TrustStrip() {
  return (
    <div className="hidden bg-navy lg:block">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-center divide-x divide-navy-foreground/15 px-6">
        {items.map((item) => (
          <span
            key={item.label}
            className="flex items-center gap-1.5 px-5 font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-navy-foreground/70 first:pl-0 last:pr-0"
          >
            <item.icon className="size-3.5 text-primary" aria-hidden="true" />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  )
}
