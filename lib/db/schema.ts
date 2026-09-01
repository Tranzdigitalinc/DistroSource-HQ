import { pgTable, text, timestamp, boolean, serial, integer, numeric, jsonb, unique } from "drizzle-orm/pg-core"

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

// --- App tables --------------------------------------------------------------

export const countries = pgTable("countries", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  flagEmoji: text("flag_emoji"),
  currencyCode: text("currency_code").notNull(),
  currencySymbol: text("currency_symbol").notNull(),
  usdToLocalRate: numeric("usd_to_local_rate", { precision: 12, scale: 6 }).notNull().default("1"),
  isPopular: boolean("is_popular").notNull().default(false),
})

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  iconName: text("icon_name").notNull().default("tag"),
  sortOrder: integer("sort_order").notNull().default(0),
  reloadlyCategoryId: integer("reloadly_category_id"),
})

export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  categoryId: integer("category_id").notNull(),
  logoUrl: text("logo_url"),
  brandColor: text("brand_color"),
  description: text("description"),
  isFeatured: boolean("is_featured").notNull().default(false),
  rating: numeric("rating", { precision: 3, scale: 2 }).notNull().default("4.5"),
  reviewCount: integer("review_count").notNull().default(0),
  reloadlyBrandId: integer("reloadly_brand_id"),
})

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  brandId: integer("brand_id").notNull(),
  categoryId: integer("category_id").notNull(),
  countryId: integer("country_id"),
  productType: text("product_type").notNull().default("gift_card"),
  shortDescription: text("short_description"),
  description: text("description"),
  howItWorks: text("how_it_works"),
  terms: text("terms"),
  imageUrl: text("image_url"),
  isFeatured: boolean("is_featured").notNull().default(false),
  isDeal: boolean("is_deal").notNull().default(false),
  deliveryType: text("delivery_type").notNull().default("instant_code"),
  rating: numeric("rating", { precision: 3, scale: 2 }).notNull().default("4.5"),
  reviewCount: integer("review_count").notNull().default(0),
  salesCount: integer("sales_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  reloadlyProductId: integer("reloadly_product_id"),
  reloadlyStatus: text("reloadly_status"),
  reloadlyGlobal: boolean("reloadly_global"),
  reloadlySupportsPreOrder: boolean("reloadly_supports_pre_order"),
  reloadlyDenominationType: text("reloadly_denomination_type"),
  recipientCurrencyCode: text("recipient_currency_code"),
  senderCurrencyCode: text("sender_currency_code"),
  minRecipientDenomination: numeric("min_recipient_denomination", { precision: 12, scale: 4 }),
  maxRecipientDenomination: numeric("max_recipient_denomination", { precision: 12, scale: 4 }),
  minSenderDenomination: numeric("min_sender_denomination", { precision: 12, scale: 4 }),
  maxSenderDenomination: numeric("max_sender_denomination", { precision: 12, scale: 4 }),
  senderFee: numeric("sender_fee", { precision: 12, scale: 4 }),
  senderFeePercentage: numeric("sender_fee_percentage", { precision: 12, scale: 4 }),
  recipientSenderExchangeRate: numeric("recipient_sender_exchange_rate", { precision: 18, scale: 8 }),
  redeemInstruction: jsonb("redeem_instruction"),
  additionalRequirements: jsonb("additional_requirements"),
  reloadlyMetadata: jsonb("reloadly_metadata"),
  reloadlyPayload: jsonb("reloadly_payload"),
})

export const productVariants = pgTable("product_variants", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  denominationLabel: text("denomination_label").notNull(),
  faceValueUsd: numeric("face_value_usd", { precision: 10, scale: 2 }).notNull(),
  priceUsd: numeric("price_usd", { precision: 10, scale: 2 }).notNull(),
  discountPercent: integer("discount_percent").notNull().default(0),
  stockCount: integer("stock_count").notNull().default(500),
  sortOrder: integer("sort_order").notNull().default(0),
  reloadlyVariantId: text("reloadly_variant_id"),
})

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  userId: text("user_id"),
  authorName: text("author_name").notNull(),
  rating: integer("rating").notNull(),
  title: text("title"),
  body: text("body").notNull(),
  isVerifiedPurchase: boolean("is_verified_purchase").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const promotionCampaigns = pgTable("promotion_campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").unique(),
  description: text("description"),
  discountType: text("discount_type").notNull().default("percent"),
  discountValue: numeric("discount_value", { precision: 10, scale: 2 }).notNull().default("0"),
  minOrderUsd: numeric("min_order_usd", { precision: 10, scale: 2 }).notNull().default("0"),
  maxUses: integer("max_uses"),
  usedCount: integer("used_count").notNull().default(0),
  startsAt: timestamp("starts_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const productBundles = pgTable("product_bundles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  discountPercent: integer("discount_percent").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const operationEvents = pgTable("operation_events", {
  id: serial("id").primaryKey(),
  eventType: text("event_type").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  status: text("status").notNull().default("open"),
  payload: jsonb("payload"),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
})

export const abandonedCarts = pgTable("abandoned_carts", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  email: text("email").notNull(),
  cartSnapshot: jsonb("cart_snapshot").notNull(),
  subtotalUsd: numeric("subtotal_usd", { precision: 10, scale: 2 }).notNull().default("0"),
  recoveryToken: text("recovery_token").notNull().unique(),
  status: text("status").notNull().default("open"),
  lastRemindedAt: timestamp("last_reminded_at"),
  recoveredAt: timestamp("recovered_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  description: text("description"),
  discountPercent: integer("discount_percent").notNull(),
  minOrderUsd: numeric("min_order_usd", { precision: 10, scale: 2 }).notNull().default("0"),
  maxUses: integer("max_uses"),
  usedCount: integer("used_count").notNull().default(0),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").notNull().default(true),
})

export const wishlistItems = pgTable(
  "wishlist_items",
  {
    id: serial("id").primaryKey(),
    userId: text("userId").notNull(),
    productId: integer("product_id").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userProductUnique: unique().on(table.userId, table.productId),
  }),
)

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  productId: integer("product_id").notNull(),
  variantId: integer("variant_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  userId: text("userId").notNull(),
  status: text("status").notNull().default("completed"),
  subtotalUsd: numeric("subtotal_usd", { precision: 10, scale: 2 }).notNull(),
  discountUsd: numeric("discount_usd", { precision: 10, scale: 2 }).notNull().default("0"),
  totalUsd: numeric("total_usd", { precision: 10, scale: 2 }).notNull(),
  couponCode: text("coupon_code"),
  affiliateCode: text("affiliate_code"),
  referralCode: text("referral_code"),
  billingEmail: text("billing_email").notNull(),
  billingName: text("billing_name").notNull(),
  paymentMethod: text("payment_method").notNull().default("card"),
  confirmationEmailSent: boolean("confirmation_email_sent").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const referralCodes = pgTable("referral_codes", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull().unique(),
  code: text("code").notNull().unique(),
  rewardDiscountPercent: integer("reward_discount_percent").notNull().default(10),
  refereeDiscountPercent: integer("referee_discount_percent").notNull().default(10),
  redemptionCount: integer("redemption_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const referralRedemptions = pgTable("referral_redemptions", {
  id: serial("id").primaryKey(),
  referralCodeId: integer("referral_code_id").notNull(),
  referrerUserId: text("referrer_user_id").notNull(),
  refereeUserId: text("referee_user_id").notNull().unique(),
  refereeOrderId: integer("referee_order_id"),
  rewardCouponCode: text("reward_coupon_code"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  rewardedAt: timestamp("rewarded_at"),
})

export const affiliateCodes = pgTable("affiliate_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  partnerName: text("partner_name").notNull(),
  contactEmail: text("contact_email"),
  commissionPercent: numeric("commission_percent", { precision: 5, scale: 2 }).notNull().default("5"),
  isActive: boolean("is_active").notNull().default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  variantId: integer("variant_id").notNull(),
  productName: text("product_name").notNull(),
  denominationLabel: text("denomination_label").notNull(),
  unitPriceUsd: numeric("unit_price_usd", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull().default(1),
  redemptionCode: text("redemption_code").notNull(),
  redemptionInstructions: text("redemption_instructions"),
  isRevealed: boolean("is_revealed").notNull().default(false),
  isVoided: boolean("is_voided").notNull().default(false),
})

export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  subject: text("subject").notNull(),
  category: text("category").notNull().default("general"),
  message: text("message").notNull(),
  orderNumber: text("order_number"),
  status: text("status").notNull().default("open"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const notificationPreferences = pgTable("notification_preferences", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull().unique(),
  orderUpdates: boolean("order_updates").notNull().default(true),
  deals: boolean("deals").notNull().default(true),
  productNews: boolean("product_news").notNull().default(false),
  accountAlerts: boolean("account_alerts").notNull().default(true),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const visitorLogs = pgTable("visitor_logs", {
  id: serial("id").primaryKey(),
  visitorId: text("visitor_id").notNull(),
  userId: text("user_id"),
  path: text("path").notNull(),
  action: text("action").notNull().default("page_view"),
  referrer: text("referrer"),
  ipAddress: text("ip_address"),
  country: text("country"),
  region: text("region"),
  city: text("city"),
  deviceType: text("device_type"),
  browser: text("browser"),
  os: text("os"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const ipReputation = pgTable("ip_reputation", {
  ipAddress: text("ip_address").primaryKey(),
  abuseConfidenceScore: integer("abuse_confidence_score"),
  totalReports: integer("total_reports"),
  isWhitelisted: boolean("is_whitelisted"),
  isPrivate: boolean("is_private").notNull().default(false),
  isp: text("isp"),
  usageType: text("usage_type"),
  domain: text("domain"),
  countryCode: text("country_code"),
  lastCheckedAt: timestamp("last_checked_at").notNull().defaultNow(),
})

export const bulkGiftRequests = pgTable("bulk_gift_requests", {
  id: serial("id").primaryKey(),
  userId: text("userId"),
  companyName: text("company_name").notNull(),
  contactName: text("contact_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  productInterest: text("product_interest"),
  quantityEstimate: integer("quantity_estimate"),
  budgetUsd: numeric("budget_usd", { precision: 12, scale: 2 }),
  message: text("message"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})
