"use client"

import Link from "next/link"
import { Star, Quote } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal"
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
      <Reveal className="mb-10 flex flex-col gap-2 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">Customer record</p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            What shoppers are saying
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Real reviews from customers across our catalog.
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono">
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
      </Reveal>

      <RevealGroup className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3" stagger={0.07}>
        {reviews.map(({ review, product }) => (
          <RevealItem key={review.id}>
            <Link
              href={`/products/${product.slug}`}
              className="group relative flex h-full flex-col gap-3 bg-card p-5 transition-colors hover:bg-background"
            >
              <Quote className="absolute right-4 top-4 size-8 text-primary/10" aria-hidden />
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`size-3.5 ${i < review.rating ? "fill-primary text-primary" : "text-border"}`}
                  />
                ))}
              </div>
              {review.title && <p className="font-display text-sm font-bold text-foreground">{review.title}</p>}
              <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">{review.body}</p>
              <div className="mt-auto flex items-center gap-2.5 border-t border-border pt-3">
                <Avatar size="sm">
                  <AvatarFallback className="rounded-[3px] bg-primary/10 text-primary text-[10px] font-bold">
                    {initials(review.authorName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-col">
                  <span className="text-xs font-medium text-foreground">{review.authorName}</span>
                  <span className="truncate font-mono text-[11px] text-muted-foreground">on {product.name}</span>
                </div>
              </div>
            </Link>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  )
}
