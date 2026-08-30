import { Zap, ShieldCheck, Globe2, HeadphonesIcon } from "lucide-react"

const items = [
  { icon: Zap, label: "Instant digital delivery" },
  { icon: ShieldCheck, label: "Encrypted, secure checkout" },
  { icon: Globe2, label: "190+ countries served" },
  { icon: HeadphonesIcon, label: "24/7 human support" },
]

export function TrustStrip() {
  return (
    <div className="hidden border-b border-border/60 bg-secondary/50 lg:block">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-center gap-8 px-6">
        {items.map((item) => (
          <span key={item.label} className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <item.icon className="size-3.5 text-primary" aria-hidden="true" />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  )
}
