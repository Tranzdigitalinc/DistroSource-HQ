// Only safe, non-destructive events can be auto-retried from a single click.
export const RETRYABLE_EVENT_TYPES = ["confirmation_email_failed"]

export function isRetryableEvent(eventType: string) {
  return RETRYABLE_EVENT_TYPES.includes(eventType)
}
