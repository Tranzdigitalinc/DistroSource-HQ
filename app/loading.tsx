/**
 * Route-level fallback. Deliberately quiet: the first visit is covered by
 * the brand curtain mounted in the root layout, and every navigation after
 * that shows progress in the top bar. A blank ground here means pages never
 * flash a spinner between routes.
 */
export default function Loading() {
  return <div aria-busy="true" aria-label="Loading" className="min-h-screen bg-background" />
}
