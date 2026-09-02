import Link from "next/link"
import { redirect } from "next/navigation"
import { headers as nextHeaders } from "next/headers"
import { ArrowLeft, Star } from "lucide-react"
import { auth } from "@/lib/auth"
import { getAdminReviews } from "@/lib/actions/admin-reviews"
import { isAdminEmail } from "@/lib/admin-emails"
import { Button } from "@/components/ui/button"
import { DeleteReviewButton } from "@/components/admin/delete-review-button"

export const metadata = {
  title: "Reviews | DistroSource Admin",
  description: "Moderate customer product reviews.",
}

export default async function AdminReviewsPage() {
  const session = await auth.api.getSession({ headers: await nextHeaders() })
  if (!session?.user || !isAdminEmail(session.user.email)) redirect("/sign-in")

  const reviews = await getAdminReviews()

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <header>
        <Button variant="outline" size="sm" render={<Link href="/admin" />} nativeButton={false}>
          <ArrowLeft className="h-4 w-4" />
          Admin
        </Button>
        <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-foreground">Reviews</h1>
        <p className="mt-1 text-sm text-muted-foreground">{reviews.length} review{reviews.length === 1 ? "" : "s"} across the catalog.</p>
      </header>

      <div className="flex flex-col gap-3">
        {reviews.length === 0 ? (
          <div className="flex items-center justify-center rounded-xl border border-dashed border-border py-16 text-sm text-muted-foreground">
            No reviews yet.
          </div>
        ) : (
          reviews.map(({ review, product, reviewer }) => (
            <div key={review.id} className="flex items-start justify-between gap-4 rounded-xl border border-border bg-card p-4">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${i < review.rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
                    />
                  ))}
                  {review.title ? <p className="ml-1 truncate text-sm font-medium text-foreground">{review.title}</p> : null}
                </div>
                {review.body ? <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{review.body}</p> : null}
                <p className="mt-2 text-xs text-muted-foreground">
                  {reviewer?.name ?? "Deleted user"} on{" "}
                  <Link href={`/admin/products/${product.id}`} className="text-foreground hover:text-primary">
                    {product.name}
                  </Link>{" "}
                  · {review.createdAt.toLocaleDateString()}
                </p>
              </div>
              <DeleteReviewButton reviewId={review.id} />
            </div>
          ))
        )}
      </div>
    </main>
  )
}
