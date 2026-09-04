# Admin authorization: current state and migration plan

**Status: documented only. No change has been made to admin access.**

**Phase 1 is BLOCKED pending database access.** The queries below must be run
read-only first to confirm which accounts exist and what `role` values are
already populated. Until that is done, no phase may begin — activating RBAC
against an unverified `user` table is exactly how the current administrator
gets locked out.

Run this first (read-only):

```sql
-- Which allow-listed emails actually have accounts, and what role do they hold?
SELECT id, email, role, "emailVerified", "createdAt"
FROM "user"
WHERE lower(email) IN ('info@corevalleyjo.com','admin@distrosource.com','amjad@distrosource.com');

-- Is role populated at all, or is everything still the default?
SELECT role, count(*) FROM "user" GROUP BY 1;
```

An allow-listed address with **no row** has never signed up. They must create
an account before Phase 3, or they lose access permanently.

## Current mechanism

Authorization is a hardcoded email allow-list in `lib/admin-emails.ts`:

```ts
const ADMIN_EMAILS = new Set([
  "info@corevalleyjo.com",
  "admin@distrosource.com",
  "amjad@distrosource.com",
])
```

Every `app/admin/**` page calls `isAdminEmail(session.user.email)` and
redirects on failure.

The `user.role` column exists (`text`, default `"customer"`) and is *displayed*
in the admin customers table, but it is **not used for any access decision**.

### What is actually right about it

Checks run server-side in Server Components before render, so they are a real
boundary, not a hidden menu item. That part is sound.

### What is wrong with it

1. **Adding or removing an admin requires a code change and a deploy.** During
   an incident there is no way to revoke access quickly.
2. **Two sources of truth.** `user.role` says one thing, the allow-list says
   another. A reviewer reading the schema will reasonably conclude roles are
   enforced when they are not.
3. **Email as identity.** If email changes are ever permitted, admin access
   follows the address rather than the account.
4. **Not a gap, but worth stating:** admin Server Actions *are* independently
   reachable endpoints, and all 31 of them across `lib/actions/admin-*.ts`,
   `order-management.ts`, `operations.ts`, `visitor-logs.ts` and
   `affiliates.ts` do call `requireAdmin()`. That was verified. Whatever
   replaces the allow-list must preserve this — the page guard is not the
   boundary, the per-action check is.

## Migration plan

The ordering matters: the existing administrator must never lose access at any
point, so the database becomes authoritative only after it is known to be
correct.

### Phase 1 — Backfill (no behaviour change)

Set `role = 'admin'` for the accounts currently on the allow-list, and verify
the result before anything reads it:

```sql
UPDATE "user" SET role = 'admin'
WHERE lower(email) IN ('info@corevalleyjo.com', 'admin@distrosource.com', 'amjad@distrosource.com');

-- Must return one row per real admin account before continuing.
SELECT id, email, role FROM "user" WHERE role = 'admin';
```

If an allow-listed address has no `user` row, that person has never signed up.
They must create an account first — otherwise Phase 3 silently locks them out.

### Phase 2 — Union check (belt and braces)

Introduce a single `requireAdmin()` helper that grants access if **either**
source says admin:

```ts
// lib/authz.ts
import "server-only"

export async function requireAdmin() {
  const session = await getSession()
  if (!session?.user) redirect("/sign-in")

  const [row] = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1)

  // Union during migration: DB role OR legacy allow-list.
  if (row?.role !== "admin" && !isAdminEmail(session.user.email)) redirect("/")
  return session
}
```

Replace every `app/admin/**` guard and every `lib/actions/admin-*.ts` mutation
with a call to this one helper. Access is now strictly a superset of today's,
so nobody can be locked out.

Run in this state long enough to confirm from `operation_events` that the
admins are reaching admin pages via the DB role, not the fallback.

### Phase 3 — Drop the allow-list

Remove the `isAdminEmail` branch from `requireAdmin()`, delete
`lib/admin-emails.ts`, and make `user.role` authoritative.

**Precondition, non-negotiable:** at least one confirmed, working `role='admin'`
account, verified by an actual sign-in — not by reading the table.

### Phase 4 — Constrain the column

Three roles, per the brief:

| Role | Grants |
|---|---|
| `customer` | Default. Storefront, own orders, own library. |
| `support` | Read customer/order data, resend confirmations, open/resolve support tickets and operation events. **No** refunds, no catalog publishing, no rights approval. |
| `admin` | Everything, including refunds, publishing and rights approval. |

`requireAdmin()` becomes `requireRole(...roles)` so a route can ask for
`["admin","support"]` where support staff legitimately need access, and
`["admin"]` for money-moving or catalog-publishing actions. Refunds, publish
and rights approval stay `admin`-only.

```sql
ALTER TABLE "user" ADD CONSTRAINT user_role_check
  CHECK (role IN ('customer', 'support', 'admin'));
```

Do this through the migration workflow in `docs/DATABASE-MIGRATIONS.md`, not an
ad-hoc script.

## Emergency fallback

Keep `isAdminEmail` as a **break-glass** path through Phase 3, behind an env
flag (`ADMIN_EMAIL_FALLBACK=1`) that is off by default and can be switched on
from the Vercel dashboard without a deploy. That gives a way back in if the
role data turns out to be wrong, without leaving a permanent second
authorization path. Remove it once the DB-backed roles have been exercised in
production for a full cycle.

## Do not

- Do not build role editing into the admin UI before Phase 3. A privilege-
  escalation bug there is far more damaging than the inconvenience of a deploy.
- Do not read the role from the session/JWT. Better Auth's session payload is
  not currently a trusted carrier for authorization claims; read the role from
  the database on each admin request.
