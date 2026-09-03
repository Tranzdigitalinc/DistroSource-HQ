// Centralized allow-list of admin accounts. Add new admin emails here (lowercase).
const ADMIN_EMAILS = new Set([
  "info@corevalleyjo.com",
  "admin@distrosource.com",
  "amjad@distrosource.com",
])

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return ADMIN_EMAILS.has(email.trim().toLowerCase())
}
