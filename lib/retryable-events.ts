// Only safe, non-destructive events can be auto-retried from a single click.
// Reloadly catalog syncs are intentionally excluded: a sync failure retry
// would silently re-run a transaction that wipes and reimports the entire
// catalog, orders, reviews, and cart data — that must stay a manual,
// checkbox-confirmed action on the Reloadly sync panel, never a one-click retry.
export const RETRYABLE_EVENT_TYPES = ["confirmation_email_failed"]

export function isRetryableEvent(eventType: string) {
  return RETRYABLE_EVENT_TYPES.includes(eventType)
}
