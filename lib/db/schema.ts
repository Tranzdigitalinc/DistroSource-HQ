import { pgTable, text, timestamp, boolean, serial, integer, numeric, jsonb, type AnyPgColumn } from "drizzle-orm/pg-core"

// --- Better Auth required tables -------------------------------------------
// Column names are camelCase to match Better Auth's defaults. Do not rename.

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  role: text("role").notNull().default("customer"),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  issuer: text("issuer"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

// --- Catalog -----------------------------------------------------------------

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  heroImageUrl: text("heroImageUrl"),
  sortOrder: integer("sortOrder").notNull().default(0),
  seoTitle: text("seoTitle"),
  seoDescription: text("seoDescription"),
  // Null for top-level departments (e.g. "Web & Development"). Set for
  // subcategories, pointing at the department they belong to (e.g.
  // "React / Next.js Templates" -> "Web & Development"). Products always
  // attach to a subcategory, never directly to a department.
  parentId: integer("parentId").references((): AnyPgColumn => categories.id),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  sku: text("sku").unique(),
  name: text("name").notNull(),
  tagline: text("tagline"),
  description: text("description").notNull(),
  categoryId: integer("categoryId")
    .notNull()
    .references(() => categories.id),
  status: text("status").notNull().default("draft"), // draft | published
  basePrice: numeric("basePrice", { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: numeric("compareAtPrice", { precision: 10, scale: 2 }),
  thumbnailUrl: text("thumbnailUrl"),
  coverImageUrl: text("coverImageUrl"),
  fileFormats: text("fileFormats").array().notNull().default([]),
  fileSizeMb: numeric("fileSizeMb", { precision: 10, scale: 2 }),
  softwareCompatibility: text("softwareCompatibility").array().notNull().default([]),
  currentVersion: text("currentVersion").notNull().default("1.0.0"),
  includedFiles: text("includedFiles").array().notNull().default([]),
  documentation: text("documentation"),
  tags: text("tags").array().notNull().default([]),
  isFeatured: boolean("isFeatured").notNull().default(false),
  isNewRelease: boolean("isNewRelease").notNull().default(false),
  isFree: boolean("isFree").notNull().default(false),
  isBundle: boolean("isBundle").notNull().default(false),
  seoTitle: text("seoTitle"),
  seoDescription: text("seoDescription"),
  // asset lifecycle: "ready" products are purchasable and public; "preview_only"
  // products can be browsed but not bought (assets not yet attached).
  assetStatus: text("assetStatus").notNull().default("ready"),
  subcategory: text("subcategory"),
  features: text("features").array().notNull().default([]),
  searchKeywords: text("searchKeywords").array().notNull().default([]),
  releaseDate: timestamp("releaseDate").notNull().defaultNow(),
  // --- Product rights / inventory compliance -------------------------------
  // sourceType: distrosource_original | verified_creator | licensed_supplier | external_affiliate
  sourceType: text("sourceType").notNull().default("distrosource_original"),
  // rightsStatus: original | licensed_for_distribution | supplier_verified | pending_verification | rejected
  // Only original | licensed_for_distribution | supplier_verified may be sold.
  rightsStatus: text("rightsStatus").notNull().default("original"),
  rightsOwner: text("rightsOwner"),
  supplierName: text("supplierName"),
  supplierReference: text("supplierReference"),
  proofOfRights: text("proofOfRights"),
  verificationDate: timestamp("verificationDate"),
  verifiedBy: text("verifiedBy"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const productImages = pgTable("product_images", {
  id: serial("id").primaryKey(),
  productId: integer("productId")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  alt: text("alt"),
  sortOrder: integer("sortOrder").notNull().default(0),
})

export const productLicenses = pgTable("product_licenses", {
  id: serial("id").primaryKey(),
  productId: integer("productId")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  licenseType: text("licenseType").notNull(), // personal | commercial | agency (regular_license is legacy, draft products only)
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  sortOrder: integer("sortOrder").notNull().default(0),
})

export const productFiles = pgTable("product_files", {
  id: serial("id").primaryKey(),
  productId: integer("productId")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  licenseType: text("licenseType"), // null = included with all licenses
  fileName: text("fileName").notNull(),
  blobPathname: text("blobPathname").notNull(),
  fileSizeBytes: integer("fileSizeBytes"),
  fileType: text("fileType"),
  sortOrder: integer("sortOrder").notNull().default(0),
})

export const productVersions = pgTable("product_versions", {
  id: serial("id").primaryKey(),
  productId: integer("productId")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  version: text("version").notNull(),
  changelog: text("changelog"),
  releasedAt: timestamp("releasedAt").notNull().defaultNow(),
})

export const bundleItems = pgTable("bundle_items", {
  id: serial("id").primaryKey(),
  bundleProductId: integer("bundleProductId")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  includedProductId: integer("includedProductId")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
})

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("productId")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  userId: text("userId").notNull(),
  rating: integer("rating").notNull(),
  title: text("title"),
  body: text("body"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

// --- Cart / Checkout / Orders -------------------------------------------------

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  productId: integer("productId")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  licenseId: integer("licenseId")
    .notNull()
    .references(() => productLicenses.id),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  description: text("description"),
  discountPercent: integer("discountPercent").notNull(),
  minOrderUsd: numeric("minOrderUsd", { precision: 10, scale: 2 }).notNull().default("0"),
  maxUses: integer("maxUses"),
  usedCount: integer("usedCount").notNull().default(0),
  expiresAt: timestamp("expiresAt"),
  isActive: boolean("isActive").notNull().default(true),
})

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("orderNumber").notNull().unique(),
  userId: text("userId").notNull(),
  status: text("status").notNull().default("completed"), // pending_payment | completed | refunded | partially_refunded | failed | canceled | expired
  subtotalUsd: numeric("subtotalUsd", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("usd"),
  discountUsd: numeric("discountUsd", { precision: 10, scale: 2 }).notNull().default("0"),
  totalUsd: numeric("totalUsd", { precision: 10, scale: 2 }).notNull(),
  couponCode: text("couponCode"),
  affiliateCode: text("affiliateCode"),
  referralCode: text("referralCode"),
  billingEmail: text("billingEmail").notNull(),
  billingName: text("billingName").notNull(),
  paymentMethod: text("paymentMethod").notNull().default("card"),
  confirmationEmailSent: boolean("confirmationEmailSent").notNull().default(false),
  paypalOrderId: text("paypalOrderId"),
  paypalCaptureId: text("paypalCaptureId"),
  polarCheckoutId: text("polarCheckoutId"),
  polarOrderId: text("polarOrderId"),
  // Polar customer this order was billed to (maps to our userId via
  // externalCustomerId at checkout creation time).
  polarCustomerId: text("polarCustomerId"),
  // Actual amount Polar reports as paid (post discount + tax), captured from
  // the order.paid webhook. May differ from totalUsd once tax is applied by
  // Polar, so this is the authoritative "what the customer was charged" figure.
  polarPaidAmount: numeric("polarPaidAmount", { precision: 10, scale: 2 }),
  polarPaidCurrency: text("polarPaidCurrency"),
  polarPaidAt: timestamp("polarPaidAt"),
  polarRefundedAmount: numeric("polarRefundedAmount", { precision: 10, scale: 2 }),
  polarRefundedAt: timestamp("polarRefundedAt"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

// Records every processed Polar webhook delivery by its "webhook-id" header
// (standardwebhooks/svix delivery id). Retried deliveries reuse the same id,
// so inserting here first and skipping on conflict makes webhook processing
// idempotent across order.paid, order.refunded, and any future event types.
export const polarWebhookEvents = pgTable("polar_webhook_events", {
  id: text("id").primaryKey(),
  eventType: text("eventType").notNull(),
  orderId: integer("orderId").references(() => orders.id),
  payload: jsonb("payload"),
  processedAt: timestamp("processedAt").notNull().defaultNow(),
})

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("orderId")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("productId")
    .notNull()
    .references(() => products.id),
  licenseId: integer("licenseId")
    .notNull()
    .references(() => productLicenses.id),
  productName: text("productName").notNull(),
  licenseType: text("licenseType").notNull(),
  unitPriceUsd: numeric("unitPriceUsd", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull().default(1),
  discountUsd: numeric("discountUsd", { precision: 10, scale: 2 }).notNull().default("0"),
  finalLineAmountUsd: numeric("finalLineAmountUsd", { precision: 10, scale: 2 }).notNull().default("0"),
  productVersion: text("productVersion"),
  currency: text("currency").notNull().default("usd"),
  isVoided: boolean("isVoided").notNull().default(false),
})

export const entitlements = pgTable("entitlements", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  productId: integer("productId")
    .notNull()
    .references(() => products.id),
  licenseId: integer("licenseId")
    .notNull()
    .references(() => productLicenses.id),
  orderId: integer("orderId")
    .notNull()
    .references(() => orders.id),
  orderItemId: integer("orderItemId")
    .notNull()
    .references(() => orderItems.id),
  isRevoked: boolean("isRevoked").notNull().default(false),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const downloadEvents = pgTable("download_events", {
  id: serial("id").primaryKey(),
  entitlementId: integer("entitlementId")
    .notNull()
    .references(() => entitlements.id, { onDelete: "cascade" }),
  userId: text("userId").notNull(),
  productFileId: integer("productFileId")
    .notNull()
    .references(() => productFiles.id),
  ipAddress: text("ipAddress"),
  downloadedAt: timestamp("downloadedAt").notNull().defaultNow(),
})

export const wishlistItems = pgTable("wishlist_items", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  productId: integer("productId")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

// --- Support / Marketing / Ops ------------------------------------------------

export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  userId: text("userId"),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  orderNumber: text("orderNumber"),
  status: text("status").notNull().default("open"),
  priority: text("priority").notNull().default("normal"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

// Email-based support inbox for support@distrosource.com, backed by Resend
// (send + inbound webhook). Distinct from `supportTickets` above, which is a
// simpler logged-in-account ticket form. A conversation groups every inbound
// and outbound message in one thread so replies land in context.
export const supportConversations = pgTable("support_conversations", {
  id: serial("id").primaryKey(),
  subject: text("subject").notNull(),
  customerEmail: text("customerEmail").notNull(),
  customerName: text("customerName"),
  userId: text("userId"),
  status: text("status").notNull().default("open"), // open | closed
  lastMessageAt: timestamp("lastMessageAt").notNull().defaultNow(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const supportMessages = pgTable("support_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversationId")
    .notNull()
    .references(() => supportConversations.id, { onDelete: "cascade" }),
  direction: text("direction").notNull(), // inbound | outbound
  body: text("body").notNull(),
  fromEmail: text("fromEmail").notNull(),
  adminUserId: text("adminUserId"), // set on outbound replies sent by an admin
  resendEmailId: text("resendEmailId"), // Resend's id for the sent/received email
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  subscribedAt: timestamp("subscribedAt").notNull().defaultNow(),
  isActive: boolean("isActive").notNull().default(true),
})

export const notificationPreferences = pgTable("notification_preferences", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull().unique(),
  productUpdates: boolean("productUpdates").notNull().default(true),
  newReleases: boolean("newReleases").notNull().default(true),
  promotions: boolean("promotions").notNull().default(true),
  orderUpdates: boolean("orderUpdates").notNull().default(true),
})

export const abandonedCarts = pgTable("abandoned_carts", {
  id: serial("id").primaryKey(),
  userId: text("userId"),
  email: text("email").notNull(),
  cartSnapshot: jsonb("cartSnapshot").notNull(),
  subtotalUsd: numeric("subtotalUsd", { precision: 10, scale: 2 }).notNull(),
  recoveryToken: text("recoveryToken").notNull().unique(),
  status: text("status").notNull().default("open"),
  lastRemindedAt: timestamp("lastRemindedAt"),
  recoveredAt: timestamp("recoveredAt"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const visitorLogs = pgTable("visitor_logs", {
  id: serial("id").primaryKey(),
  visitorId: text("visitorId").notNull(),
  path: text("path").notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  referrer: text("referrer"),
  country: text("country"),
  deviceType: text("deviceType"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const ipReputation = pgTable("ip_reputation", {
  ipAddress: text("ipAddress").primaryKey(),
  abuseConfidenceScore: integer("abuseConfidenceScore"),
  totalReports: integer("totalReports"),
  isWhitelisted: boolean("isWhitelisted"),
  isPrivate: boolean("isPrivate").notNull().default(false),
  isp: text("isp"),
  usageType: text("usageType"),
  domain: text("domain"),
  countryCode: text("countryCode"),
  lastCheckedAt: timestamp("lastCheckedAt").notNull().defaultNow(),
})

export const operationEvents = pgTable("operation_events", {
  id: serial("id").primaryKey(),
  eventType: text("eventType").notNull(),
  entityType: text("entityType").notNull(),
  entityId: text("entityId"),
  status: text("status").notNull().default("open"),
  payload: jsonb("payload"),
  createdBy: text("createdBy"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  resolvedAt: timestamp("resolvedAt"),
})

export const referralCodes = pgTable("referral_codes", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull().unique(),
  code: text("code").notNull().unique(),
  rewardDiscountPercent: integer("rewardDiscountPercent").notNull().default(10),
  refereeDiscountPercent: integer("refereeDiscountPercent").notNull().default(10),
  redemptionCount: integer("redemptionCount").notNull().default(0),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const referralRedemptions = pgTable("referral_redemptions", {
  id: serial("id").primaryKey(),
  referralCodeId: integer("referralCodeId")
    .notNull()
    .references(() => referralCodes.id, { onDelete: "cascade" }),
  referrerUserId: text("referrerUserId").notNull(),
  refereeUserId: text("refereeUserId").notNull().unique(),
  refereeOrderId: integer("refereeOrderId").references(() => orders.id),
  rewardCouponCode: text("rewardCouponCode"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  rewardedAt: timestamp("rewardedAt"),
})

export const affiliateCodes = pgTable("affiliate_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  partnerName: text("partnerName").notNull(),
  contactEmail: text("contactEmail"),
  commissionPercent: numeric("commissionPercent", { precision: 5, scale: 2 }).notNull().default("5"),
  isActive: boolean("isActive").notNull().default(true),
  notes: text("notes"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const promotionCampaigns = pgTable("promotion_campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").unique(),
  description: text("description"),
  discountType: text("discountType").notNull().default("percent"),
  discountValue: numeric("discountValue", { precision: 10, scale: 2 }).notNull().default("0"),
  minOrderUsd: numeric("minOrderUsd", { precision: 10, scale: 2 }).notNull().default("0"),
  maxUses: integer("maxUses"),
  usedCount: integer("usedCount").notNull().default(0),
  startsAt: timestamp("startsAt").notNull().defaultNow(),
  expiresAt: timestamp("expiresAt"),
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const teamLicenseRequests = pgTable("team_license_requests", {
  id: serial("id").primaryKey(),
  userId: text("userId"),
  companyName: text("companyName").notNull(),
  contactName: text("contactName").notNull(),
  contactEmail: text("contactEmail").notNull(),
  productInterest: text("productInterest"),
  seatsEstimate: integer("seatsEstimate"),
  budgetUsd: numeric("budgetUsd", { precision: 12, scale: 2 }),
  message: text("message"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

// Shared rate-limit counters. Must be shared state rather than per-instance
// memory: Vercel runs many function instances, so an in-process counter limits
// nothing. One row per bucket+identifier, incremented atomically.
//
// NOT YET PRESENT IN PRODUCTION — created by the baseline migration. Until
// then lib/rate-limit.ts fails open and logs. See docs/DATABASE-MIGRATIONS.md.
export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull().default(0),
  windowStart: timestamp("windowStart").notNull().defaultNow(),
})
