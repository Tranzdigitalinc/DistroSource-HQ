import { pgTable, text, timestamp, boolean, serial, integer, numeric, jsonb } from "drizzle-orm/pg-core"

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
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
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
  licenseType: text("licenseType").notNull(), // personal | commercial | extended_commercial | agency
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
  discountType: text("discountType").notNull(), // percent | fixed
  discountValue: numeric("discountValue", { precision: 10, scale: 2 }).notNull(),
  maxUses: integer("maxUses"),
  usedCount: integer("usedCount").notNull().default(0),
  expiresAt: timestamp("expiresAt"),
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  orderNumber: text("orderNumber").notNull().unique(),
  status: text("status").notNull().default("pending"), // pending | paid | refunded | failed
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  discount: numeric("discount", { precision: 10, scale: 2 }).notNull().default("0"),
  tax: numeric("tax", { precision: 10, scale: 2 }).notNull().default("0"),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  couponCode: text("couponCode"),
  paymentProvider: text("paymentProvider"),
  paymentId: text("paymentId"),
  customerEmail: text("customerEmail"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
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
  unitPrice: numeric("unitPrice", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
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
  email: text("email"),
  itemsSnapshot: jsonb("itemsSnapshot"),
  totalValue: numeric("totalValue", { precision: 10, scale: 2 }),
  reminderSentAt: timestamp("reminderSentAt"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const visitorLogs = pgTable("visitor_logs", {
  id: serial("id").primaryKey(),
  path: text("path").notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  referrer: text("referrer"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const ipReputation = pgTable("ip_reputation", {
  id: serial("id").primaryKey(),
  ipAddress: text("ipAddress").notNull().unique(),
  riskScore: integer("riskScore").notNull().default(0),
  isBlocked: boolean("isBlocked").notNull().default(false),
  lastCheckedAt: timestamp("lastCheckedAt").notNull().defaultNow(),
})

export const operationEvents = pgTable("operation_events", {
  id: serial("id").primaryKey(),
  eventType: text("eventType").notNull(),
  entityType: text("entityType"),
  entityId: text("entityId"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const referralCodes = pgTable("referral_codes", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull().unique(),
  code: text("code").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const referralRedemptions = pgTable("referral_redemptions", {
  id: serial("id").primaryKey(),
  referralCodeId: integer("referralCodeId")
    .notNull()
    .references(() => referralCodes.id, { onDelete: "cascade" }),
  referredUserId: text("referredUserId").notNull(),
  orderId: integer("orderId").references(() => orders.id),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const affiliateCodes = pgTable("affiliate_codes", {
  id: serial("id").primaryKey(),
  partnerName: text("partnerName").notNull(),
  code: text("code").notNull().unique(),
  commissionPercent: numeric("commissionPercent", { precision: 5, scale: 2 }).notNull().default("10"),
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const promotionCampaigns = pgTable("promotion_campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  discountPercent: numeric("discountPercent", { precision: 5, scale: 2 }),
  startsAt: timestamp("startsAt"),
  endsAt: timestamp("endsAt"),
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const teamLicenseRequests = pgTable("team_license_requests", {
  id: serial("id").primaryKey(),
  companyName: text("companyName").notNull(),
  contactName: text("contactName").notNull(),
  email: text("email").notNull(),
  seatsNeeded: integer("seatsNeeded"),
  productsInterested: text("productsInterested"),
  message: text("message"),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})
