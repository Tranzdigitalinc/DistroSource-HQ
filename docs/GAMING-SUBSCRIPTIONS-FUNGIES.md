# Gaming subscriptions in Fungies

The catalog is mirrored as one Fungies `Subscription` product per DistroSource
plan. Each product owns one Fungies plan plus monthly and annual recurring
offers. Keeping products separate preserves each plan's exact description,
cover and gallery in the Fungies dashboard.

The importer is intentionally conservative:

- every product is forced to `DRAFT`;
- all 500 owned WebP previews are uploaded before the first Fungies write;
- fewer than 75 plans, missing images or incomplete entitlement copy stops the run;
- stable `externalId` values and a local checkpoint make retries idempotent;
- a failed run can be resumed without duplicating completed products;
- no fake ZIP, named future deliverable or active checkout is created.

## Commands

```bash
pnpm gaming:subscriptions:render
pnpm gaming:subscriptions:audit
pnpm gaming:subscriptions:fungies
```

The last command is a dry run. To apply:

```bash
node --env-file=.env.local --experimental-strip-types \
  scripts/gaming/subscriptions/provision-fungies.mjs --apply
```

Required environment variables:

- `FUNGIES_PUBLIC_KEY`
- `FUNGIES_SECRET_KEY`
- `FUNGIES_PROJECT_ID`
- `BLOB_READ_WRITE_TOKEN`

If the images already exist at a DistroSource-controlled public HTTPS origin,
set `FUNGIES_MEDIA_BASE_URL` and add `--skip-upload`. The importer never uses a
third-party marketplace image URL.

The resulting IDs are written after each product to
`.gaming-subscriptions/fungies-state.json`. This file is ignored because it is
an environment-specific deployment artifact; it contains IDs, not secrets.

Publishing remains a separate human release decision. Before changing a draft
to active, publish the underlying deliverables, assign product eligibility and
verify the signed webhook entitlement path.
