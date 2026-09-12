import Image from "next/image"
import Link from "next/link"
import type { GamingSubscriptionPlan } from "@/lib/gaming/subscriptions/types"

export function SubscriptionCard({ plan }: { plan: GamingSubscriptionPlan }) {
  return (
    <Link
      href={`/gaming/subscriptions/${plan.slug}`}
      className="group overflow-hidden rounded-xl border border-border bg-card transition hover:border-border-strong hover:shadow-[var(--shadow-e2)]"
    >
      <div className="relative aspect-[8/5] overflow-hidden bg-secondary">
        <Image
          src={plan.cover}
          alt={`${plan.name} subscription cover`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-[1.02] motion-reduce:transition-none"
        />
        <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/65 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-white backdrop-blur">
          Preview
        </span>
      </div>
      <div className="space-y-3 p-5">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
            {plan.family} · {plan.platform}
          </p>
          <h2 className="mt-1.5 font-display text-lg font-bold leading-tight tracking-tight">{plan.name}</h2>
        </div>
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{plan.summary}</p>
        <div className="flex items-end justify-between gap-3 border-t border-border pt-3">
          <div>
            <span className="text-xl font-bold tabular-nums">${plan.monthlyPriceUsd}</span>
            <span className="text-xs text-muted-foreground"> / month</span>
          </div>
          <span className="text-xs font-semibold text-primary">View plan →</span>
        </div>
      </div>
    </Link>
  )
}
