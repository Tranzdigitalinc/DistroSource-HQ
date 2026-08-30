import Link from "next/link"
import { Star, BadgeCheck } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { getTopReviews } from "@/lib/queries/catalog"

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

interface TestimonialsProps {
  reviews: Awaited<ReturnType<typeof getTopReviews>>
  stats: { avgRating: number; reviewCount: number }
}

export function Testimonials({ reviews, stats }: TestimonialsProps) {
  if (reviews.length === 0) return null

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8">
      <div className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
            What shoppers are saying
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Real reviews from verified purchases across our catalog.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`size-4 ${i < Math.round(stats.avgRating) ? "fill-primary text-primary" : "text-border"}`}
              />
            ))}
          </div>
          <span className="text-sm font-semibold text-foreground">{stats.avgRating.toFixed(1)}</span>
          <span className="text-sm text-muted-foreground">out of {stats.reviewCount.toLocaleString()} reviews</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map(({ review, product, brand }) => (
          <Link
            key={review.id}
            href={`/products/${product.slug}`}
            className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
          >
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`size-3.5 ${i < review.rating ? "fill-primary text-primary" : "text-border"}`}
                />
              ))}
            </div>
            {review.title && <p className="font-display text-sm font-semibold text-foreground">{review.title}</p>}
            <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">{review.body}</p>
            <div className="mt-auto flex items-center gap-2.5 border-t border-border/60 pt-3">
              <Avatar size="sm">
                <AvatarFallback>{initials(review.authorName)}</AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col">
                <span className="flex items-center gap-1 text-xs font-medium text-foreground">
                  {review.authorName}
                  {review.isVerifiedPurchase && (
                    <BadgeCheck className="size-3.5 shrink-0 text-primary" aria-label="Verified purchase" />
                  )}
                </span>
                <span className="truncate text-xs text-muted-foreground">on {brand.name}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
