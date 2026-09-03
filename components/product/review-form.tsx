"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Star } from "@/lib/storefront-icons"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { submitReview } from "@/lib/actions/reviews"

type Eligibility = { canReview: boolean; reason: "signed-out" | "not-purchased" | "already-reviewed" | null }

export function ReviewForm({ productId, eligibility }: { productId: number; eligibility: Eligibility }) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (submitted) {
    return (
      <p className="border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground">
        Thanks — your review has been posted.
      </p>
    )
  }

  if (eligibility.reason === "signed-out") {
    return (
      <p className="border border-border px-4 py-3 text-sm text-muted-foreground">
        <Link href="/sign-in" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>{" "}
        to leave a review — only verified purchasers can review a product.
      </p>
    )
  }

  if (eligibility.reason === "not-purchased") {
    return (
      <p className="border border-border px-4 py-3 text-sm text-muted-foreground">
        Only customers who&apos;ve purchased this product can leave a review.
      </p>
    )
  }

  if (eligibility.reason === "already-reviewed") {
    return (
      <p className="border border-border px-4 py-3 text-sm text-muted-foreground">
        You&apos;ve already reviewed this product. Thanks for sharing your feedback.
      </p>
    )
  }

  function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault()
    setError(null)

    if (rating < 1) {
      setError("Please select a star rating.")
      return
    }

    startTransition(async () => {
      try {
        await submitReview({ productId, rating, title, body })
        setSubmitted(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 border border-border p-4">
      <div className="flex flex-col gap-2">
        <Label>Your rating</Label>
        <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
          {Array.from({ length: 5 }).map((_, i) => {
            const value = i + 1
            const filled = value <= (hoverRating || rating)
            return (
              <button
                key={value}
                type="button"
                aria-label={`${value} out of 5 stars`}
                aria-pressed={value === rating}
                onMouseEnter={() => setHoverRating(value)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(value)}
                className="p-0.5"
              >
                <Star className={`h-6 w-6 ${filled ? "fill-primary text-primary" : "fill-none text-border"}`} />
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="review-title">Title (optional)</Label>
        <Input
          id="review-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={120}
          placeholder="Sum up your experience"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="review-body">Your review</Label>
        <Textarea
          id="review-body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          maxLength={2000}
          rows={4}
          placeholder="What did you use this for? What worked well, or didn't?"
          required
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={isPending} className="w-fit">
        {isPending ? "Posting..." : "Post review"}
      </Button>
    </form>
  )
}
