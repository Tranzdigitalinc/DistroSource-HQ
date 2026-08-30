"use client"

import { Star, ShieldCheck } from "lucide-react"
import { motion } from "motion/react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { revealItemVariants } from "@/components/motion/reveal"

interface Review {
  id: number
  authorName: string
  rating: number
  title: string | null
  body: string
  isVerifiedPurchase: boolean
  createdAt: Date
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date)
}

export function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return <p className="py-8 text-sm text-muted-foreground">No reviews yet. Be the first to share your experience.</p>
  }

  return (
    <motion.ul
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-64px" }}
      transition={{ staggerChildren: 0.05 }}
      className="flex flex-col gap-6"
    >
      {reviews.map((review) => (
        <motion.li
          key={review.id}
          variants={revealItemVariants}
          className="flex gap-3 border-b border-border pb-6 last:border-0 last:pb-0"
        >
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback className="bg-secondary text-xs font-semibold text-secondary-foreground">
              {review.authorName
                .split(" ")
                .map((p) => p[0])
                .join("")
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold">{review.authorName}</span>
              {review.isVerifiedPurchase && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  Verified purchase
                </span>
              )}
            </div>
            <div className="flex items-center gap-1" role="img" aria-label={`${review.rating} out of 5 stars`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${i < review.rating ? "fill-accent text-accent" : "fill-none text-border"}`}
                  aria-hidden="true"
                />
              ))}
              <span className="ml-1 text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
            </div>
            {review.title && <p className="text-sm font-semibold">{review.title}</p>}
            <p className="text-sm leading-relaxed text-muted-foreground">{review.body}</p>
          </div>
        </motion.li>
      ))}
    </motion.ul>
  )
}
