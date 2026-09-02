import { Pool } from "pg"
import fs from "node:fs"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const manifest = JSON.parse(fs.readFileSync(new URL("../.v0/seed/manifest.json", import.meta.url)))

function img(key) {
  return manifest.images[key]?.url ?? null
}
function file(key) {
  const f = manifest.files[key]
  if (!f) return null
  return { fileName: key, blobPathname: f.pathname }
}

const categories = [
  { slug: "templates-documents", name: "Templates & Documents", description: "Business documents, reports, and proposal templates.", icon: "FileText", sortOrder: 1 },
  { slug: "design-branding", name: "Design & Branding", description: "Logo suites, brand kits, and identity systems.", icon: "Palette", sortOrder: 2 },
  { slug: "code-templates", name: "Code & Web Templates", description: "Boilerplates, dashboards, and website templates.", icon: "Code", sortOrder: 3 },
  { slug: "graphics-icons", name: "Graphics & Icons", description: "Icon packs, illustrations, mockups, and social graphics.", icon: "Shapes", sortOrder: 4 },
  { slug: "fonts", name: "Fonts", description: "Hand-picked typefaces for branding and print.", icon: "Type", sortOrder: 5 },
  { slug: "audio", name: "Audio", description: "Royalty-free ambient and background music packs.", icon: "Music", sortOrder: 6 },
  { slug: "photography", name: "Photography Presets", description: "Lightroom presets for photographers and creators.", icon: "Camera", sortOrder: 7 },
  { slug: "3d-print", name: "3D & Print Files", description: "STL files ready for 3D printing.", icon: "Box", sortOrder: 8 },
  { slug: "productivity", name: "Productivity & Planners", description: "Notion templates, planners, and worksheets.", icon: "CheckSquare", sortOrder: 9 },
  { slug: "bundles", name: "Bundles", description: "Curated multi-product bundles at a discount.", icon: "Package", sortOrder: 10 },
]

// [slug, name, tagline, description, category, basePrice, compareAtPrice, isFeatured, isNewRelease, isFree, imageKey, fileKey, tags]
const products = [
  ["annual-report-template", "Annual Report Template", "Polished corporate reporting, ready to fill in", "A fully designed annual report template with editable charts, financial summary layouts, and cover pages built for clarity and credibility.", "templates-documents", 29, 39, true, false, false, "annual-report-cover.png", "annual-report-template.zip", ["reports", "corporate", "finance"]],
  ["business-launch-kit", "Business Launch Kit", "Everything you need to launch, in one bundle", "A complete startup document kit covering pitch outlines, launch checklists, and brand messaging worksheets.", "templates-documents", 34, null, true, false, false, "business-launch-kit-cover.png", "business-launch-kit.zip", ["startup", "business", "planning"]],
  ["pitch-deck-template", "Pitch Deck Template", "Investor-ready slides that tell a clear story", "A 20-slide investor pitch deck template with clean data visualization layouts and narrative structure guidance.", "templates-documents", 39, 49, true, false, false, "pitch-deck-cover.png", "pitch-deck-template.zip", ["pitch", "startup", "slides"]],
  ["invoice-proposal-pack", "Invoice & Proposal Pack", "Get paid faster with professional paperwork", "Editable invoice and proposal templates for freelancers and agencies, designed to look sharp and close deals.", "templates-documents", 19, null, false, true, false, "invoice-proposal-pack-cover.png", "invoice-proposal-pack.zip", ["invoice", "freelance", "proposal"]],
  ["contract-nda-bundle", "Contract & NDA Bundle", "Legal paperwork templates for freelancers", "A set of plain-language contract and NDA templates covering scope of work, payment terms, and confidentiality.", "templates-documents", 24, null, false, false, false, "contract-nda-bundle-cover.png", "contract-nda-bundle.zip", ["legal", "contract", "freelance"]],
  ["executive-resume", "Executive Resume Template", "Land the interview with a standout resume", "A premium executive resume and cover letter template with a modern two-column layout and ATS-friendly structure.", "templates-documents", 15, null, false, false, false, "executive-resume-cover.png", "executive-resume.zip", ["resume", "career", "job-search"]],
  ["resume-pack", "Resume Pack (10 Styles)", "Ten resume styles for every career stage", "A bundle of ten distinct resume layouts spanning minimal, creative, and corporate styles.", "templates-documents", 22, 29, false, false, false, "resume-pack-cover.png", "resume-pack.zip", ["resume", "career"]],
  ["freelancer-onboarding-kit", "Freelancer Onboarding Kit", "Onboard new clients smoothly, every time", "Client welcome packets, intake forms, and project kickoff templates for freelancers and consultants.", "templates-documents", 18, null, false, true, false, "freelancer-onboarding-kit-cover.png", "freelancer-onboarding-kit.zip", ["freelance", "onboarding"]],
  ["freelance-rate-calculator", "Freelance Rate Calculator", "Price your work with confidence", "A spreadsheet-based calculator that helps freelancers set hourly and project rates based on real costs and goals.", "templates-documents", 9, null, false, true, true, "freelance-rate-calculator-cover.png", "freelance-rate-calculator.zip", ["freelance", "pricing", "spreadsheet"]],

  ["branding-bakery", "Bakery Branding Kit", "Warm, hand-crafted branding for food businesses", "A complete brand identity kit for bakeries and cafes including logo marks, packaging labels, and a color palette.", "design-branding", 27, 35, true, false, false, "branding-bakery-cover.png", "branding-bakery.zip", ["branding", "logo", "food"]],
  ["branding-startup", "Startup Branding Kit", "Modern identity system for early-stage startups", "A flexible logo suite, color system, and brand guideline template designed for fast-moving startups.", "design-branding", 32, null, true, false, false, "branding-startup-cover.png", "branding-startup.zip", ["branding", "logo", "startup"]],
  ["freelance-agency-kit", "Agency Brand Kit", "Position your agency as the premium choice", "A complete branding and proposal kit for creative agencies, including case study layouts and a capabilities deck.", "design-branding", 45, 59, false, false, false, "freelance-agency-kit-cover.png", "freelance-agency-kit.zip", ["agency", "branding", "proposal"]],
  ["youtube-branding-kit", "YouTube Branding Kit", "Channel art that gets the click", "Thumbnail templates, channel banners, and end-screen graphics designed for consistent YouTube branding.", "design-branding", 21, null, false, true, false, "youtube-branding-kit-cover.png", "youtube-branding-kit.zip", ["youtube", "branding", "thumbnails"]],
  ["podcast-launch-kit", "Podcast Launch Kit", "Everything to brand and launch your show", "Cover art templates, episode graphics, and a launch checklist for new podcasters.", "design-branding", 19, null, false, true, false, "podcast-launch-kit-cover.png", "podcast-launch-kit.zip", ["podcast", "branding", "audio"]],

  ["nextjs-saas-boilerplate", "Next.js SaaS Boilerplate", "Ship your SaaS in days, not months", "A production-ready Next.js boilerplate with auth, billing hooks, and a dashboard shell pre-wired for SaaS products.", "code-templates", 89, 129, true, true, false, "nextjs-boilerplate-cover.png", "nextjs-saas-boilerplate.zip", ["nextjs", "saas", "boilerplate"]],
  ["react-admin-dashboard", "React Admin Dashboard", "Clean, responsive admin UI out of the box", "A React admin dashboard template with charts, tables, and settings pages built with reusable components.", "code-templates", 59, 79, true, false, false, "react-admin-cover.png", "react-admin-dashboard.zip", ["react", "dashboard", "admin"]],
  ["uiux-kit", "UI/UX Design Kit", "A complete component library for product design", "A Figma-ready UI kit with buttons, forms, cards, and full page layouts for web and mobile products.", "code-templates", 42, null, false, false, false, "uiux-kit-cover.png", "uiux-kit.zip", ["ui", "ux", "design-system"]],
  ["portfolio-site", "Portfolio Site Template", "A minimal site to showcase your best work", "A clean, fast portfolio website template built for designers, photographers, and developers.", "code-templates", 29, null, false, false, false, "portfolio-site-cover.png", "portfolio-site.zip", ["portfolio", "website", "html"]],
  ["saas-landing", "SaaS Landing Page Template", "A conversion-focused landing page, ready to launch", "A high-converting SaaS landing page template with pricing tables, testimonials, and FAQ sections.", "code-templates", 25, 35, true, false, false, "saas-landing-cover.png", "saas-landing.zip", ["saas", "landing-page", "marketing"]],
  ["real-estate-pack", "Real Estate Website Pack", "List properties beautifully", "A real estate website template with property listing grids, map integration layout, and agent profile pages.", "code-templates", 55, null, false, false, false, "real-estate-pack-cover.png", "real-estate-pack.zip", ["real-estate", "website"]],
  ["fashion-store", "Fashion Store Template", "An elegant storefront for apparel brands", "An e-commerce storefront template tailored for fashion and apparel brands, with lookbook-style product pages.", "code-templates", 49, null, false, false, false, "fashion-store-cover.png", "fashion-store.zip", ["ecommerce", "fashion", "website"]],

  ["line-icons-pack", "Line Icons Pack (500+)", "A cohesive icon set for any interface", "Over 500 pixel-perfect line icons covering UI, business, and lifestyle categories in SVG and font formats.", "graphics-icons", 19, 29, true, false, false, "line-icons-pack-cover.png", "line-icons-pack.zip", ["icons", "ui", "svg"]],
  ["gradient-shapes", "Gradient Shapes Pack", "Modern gradient backgrounds and shapes", "A collection of gradient mesh backgrounds and abstract shapes for presentations, social posts, and websites.", "graphics-icons", 12, null, false, false, true, "gradient-shapes-cover.png", "gradient-shapes.zip", ["gradient", "background", "abstract"]],
  ["nature-illustrations", "Nature Illustrations Set", "Hand-drawn botanical and wildlife illustrations", "A set of hand-illustrated plants, florals, and wildlife artwork for branding and print projects.", "graphics-icons", 24, null, false, false, false, "nature-illustrations-cover.png", "nature-illustrations.zip", ["illustration", "nature", "botanical"]],
  ["svg-craft-files", "SVG Craft Cut Files", "Ready-to-cut designs for makers", "A pack of SVG cut files for Cricut and Silhouette machines, covering quotes, seasonal designs, and monograms.", "graphics-icons", 14, null, false, false, false, "svg-craft-cover.png", "svg-craft-files.zip", ["svg", "craft", "cricut"]],
  ["apparel-mockup", "Apparel Mockup Pack", "Showcase your merch designs realistically", "A set of high-resolution apparel mockups including tees, hoodies, and hats on real models.", "graphics-icons", 18, null, false, false, false, "apparel-mockup-cover.png", "apparel-mockup.zip", ["mockup", "apparel", "merch"]],
  ["iphone-mockup", "iPhone Mockup Pack", "Present your app in a realistic device frame", "High-resolution iPhone mockups in multiple angles and colors for app store and portfolio presentations.", "graphics-icons", 15, null, false, false, false, "iphone-mockup-cover.png", "iphone-mockup.zip", ["mockup", "iphone", "app"]],
  ["instagram-pack", "Instagram Template Pack", "Grow your feed with cohesive visuals", "Editable Instagram post and story templates covering quotes, product promos, and carousel layouts.", "graphics-icons", 16, 22, false, true, false, "instagram-pack-cover.png", "instagram-pack.zip", ["instagram", "social-media", "templates"]],
  ["tiktok-pack", "TikTok Content Pack", "Templates built for short-form video", "A set of TikTok cover templates, caption layouts, and content planning graphics.", "graphics-icons", 14, null, false, true, false, "tiktok-pack-cover.png", "tiktok-pack.zip", ["tiktok", "social-media", "video"]],

  ["font-modern-sans", "Modern Sans Font Family", "A versatile sans-serif for branding and UI", "A clean geometric sans-serif typeface family with 6 weights, ideal for branding, editorial, and UI work.", "fonts", 25, null, true, false, false, "font-modern-sans-cover.png", "font-modern-sans.zip", ["font", "sans-serif", "typography"]],
  ["font-script-duo", "Script Duo Font Pair", "An elegant script and serif pairing", "A matching script and serif font duo designed for wedding invitations, branding, and packaging.", "fonts", 18, 24, false, false, false, "font-script-duo-cover.png", "font-script-duo.zip", ["font", "script", "typography"]],

  ["audio-ambient-pack", "Ambient Music Pack", "Royalty-free ambient tracks for any project", "A collection of 15 royalty-free ambient tracks perfect for videos, podcasts, and background music.", "audio", 29, null, false, false, false, "audio-ambient-cover.png", "audio-ambient-pack.zip", ["audio", "music", "ambient"]],

  ["lightroom-presets", "Lightroom Presets Pack", "Consistent, editorial-grade photo edits in one click", "A pack of 40 Lightroom presets for portrait, travel, and lifestyle photography with a natural, editorial look.", "photography", 22, 30, true, false, false, "lightroom-presets-cover.png", "lightroom-presets.zip", ["lightroom", "presets", "photography"]],

  ["stl-desk-organizer", "Desk Organizer STL File", "Print a tidy, modular desk organizer", "A ready-to-print STL file for a modular desk organizer with sections for pens, cards, and small tools.", "3d-print", 8, null, false, false, false, "stl-desk-organizer-cover.png", "stl-desk-organizer.zip", ["3d-print", "stl", "organizer"]],

  ["life-organizer-notion", "Life Organizer Notion Template", "One dashboard for your whole life", "A comprehensive Notion template covering tasks, habits, finances, and goals in one connected dashboard.", "productivity", 15, 20, true, false, false, "life-organizer-notion-cover.png", "life-organizer-notion.zip", ["notion", "productivity", "planner"]],
  ["startup-pm-notion", "Startup PM Notion Template", "Run your startup's roadmap in Notion", "A product management Notion template with sprint boards, roadmaps, and feedback tracking for early-stage teams.", "productivity", 19, null, false, false, false, "startup-pm-notion-cover.png", "startup-pm-notion.zip", ["notion", "startup", "project-management"]],
  ["digital-life-planner", "Digital Life Planner", "A beautiful planner for iPad and tablet", "A hyperlinked digital planner for GoodNotes and Notability with daily, weekly, and monthly spreads.", "productivity", 12, null, false, false, false, "digital-life-planner-cover.png", "digital-life-planner.zip", ["planner", "digital", "goodnotes"]],
  ["personal-budget-planner", "Personal Budget Planner", "Take control of your finances", "A spreadsheet-based budget planner with automatic calculations for monthly spending, savings, and debt payoff.", "productivity", 10, null, false, false, true, "personal-budget-planner-cover.png", "personal-budget-planner.zip", ["budget", "finance", "spreadsheet"]],
  ["classroom-worksheets", "Classroom Worksheets Bundle", "Ready-to-print worksheets for teachers", "A bundle of printable classroom worksheets covering math, reading, and creative writing for elementary grades.", "productivity", 13, null, false, false, false, "classroom-worksheets-cover.png", "classroom-worksheets.zip", ["education", "worksheets", "printable"]],
  ["kids-chore-chart", "Kids Chore Chart", "Make chores fun with a printable tracker", "A colorful, printable chore chart and reward tracker designed to motivate kids.", "productivity", 6, null, false, false, true, "kids-chore-chart-cover.png", "kids-chore-chart.zip", ["kids", "chores", "printable"]],
  ["family-meal-planner", "Family Meal Planner", "Plan meals and groceries in one place", "A printable weekly meal planner with a matching grocery list template for busy families.", "productivity", 8, null, false, false, false, "family-meal-planner-cover.png", "family-meal-planner.zip", ["meal-planning", "family", "printable"]],
  ["social-media-content-calendar", "Social Media Content Calendar", "Plan a month of content in one sitting", "A content calendar template with post ideas, caption prompts, and a hashtag tracker for social media managers.", "productivity", 12, 16, false, true, false, "social-media-content-calendar-cover.png", "social-media-content-calendar.zip", ["social-media", "content", "planner"]],
  ["email-marketing-swipe-file", "Email Marketing Swipe File", "Proven email templates that convert", "A swipe file of 30 email templates covering welcome sequences, promotions, and re-engagement campaigns.", "productivity", 17, null, false, false, false, "email-marketing-swipe-file-cover.png", "email-marketing-swipe-file.zip", ["email", "marketing", "copywriting"]],
  ["fitness-studio-pack", "Fitness Studio Brand Pack", "Launch your studio's brand and socials", "A branding and social media pack for fitness studios and personal trainers, including class schedule templates.", "productivity", 20, null, false, false, false, "fitness-studio-pack-cover.png", "fitness-studio-pack.zip", ["fitness", "branding", "social-media"]],
  ["wedding-invitation-suite", "Wedding Invitation Suite", "Elegant, editable wedding stationery", "A complete wedding stationery suite including invitations, RSVP cards, and day-of signage templates.", "productivity", 22, 28, false, false, false, "wedding-invitation-cover.png", "wedding-invitation-suite.zip", ["wedding", "invitation", "stationery"]],
]

const bundles = [
  ["agency-bundle", "Agency Growth Bundle", "Branding, proposals, and web templates in one bundle", "A bundle combining the Agency Brand Kit, Pitch Deck Template, and SaaS Landing Page Template at a discounted price.", "bundles", 89, 129, true, false, false, "agency-bundle-cover.png", ["freelance-agency-kit", "pitch-deck-template", "saas-landing"]],
  ["creator-bundle", "Content Creator Bundle", "Everything a creator needs to grow their channel", "A bundle combining the YouTube Branding Kit, Podcast Launch Kit, and TikTok Content Pack.", "bundles", 39, 59, true, false, false, "creator-bundle-cover.png", ["youtube-branding-kit", "podcast-launch-kit", "tiktok-pack"]],
]

const licenseTiers = [
  { licenseType: "personal", mult: 1, description: "For personal, non-commercial projects." },
  { licenseType: "commercial", mult: 2.5, description: "For a single commercial project or client." },
  { licenseType: "extended_commercial", mult: 5, description: "For unlimited commercial projects and resale-ready products." },
]

const reviewSeeds = [
  { rating: 5, title: "Exactly what I needed", body: "The quality is way above what I expected for the price. Saved me hours of design work." },
  { rating: 5, title: "Clean and professional", body: "Everything is well organized and easy to customize. Would buy from this store again." },
  { rating: 4, title: "Great value", body: "Solid template, minor tweaks needed for my brand but overall very happy with it." },
  { rating: 5, title: "Highly recommend", body: "This made my launch so much easier. The files are well documented and easy to edit." },
]

async function main() {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")

    const categoryIdBySlug = {}
    for (const c of categories) {
      const r = await client.query(
        `INSERT INTO categories (slug, name, description, icon, "sortOrder") VALUES ($1,$2,$3,$4,$5) RETURNING id`,
        [c.slug, c.name, c.description, c.icon, c.sortOrder],
      )
      categoryIdBySlug[c.slug] = r.rows[0].id
    }
    console.log("[v0] Inserted categories:", Object.keys(categoryIdBySlug).length)

    let adminUserId = "seed-admin-user"
    // Placeholder author id for reviews; not a real auth user, only used to satisfy NOT NULL userId column.

    let productCount = 0
    for (const p of products) {
      const [slug, name, tagline, description, catSlug, basePrice, compareAtPrice, isFeatured, isNewRelease, isFree, imageKey, fileKey, tags] = p
      const categoryId = categoryIdBySlug[catSlug]
      const coverUrl = img(imageKey)
      const f = file(fileKey)

      const r = await client.query(
        `INSERT INTO products (slug, name, tagline, description, "categoryId", status, "basePrice", "compareAtPrice", "thumbnailUrl", "coverImageUrl", "fileFormats", tags, "isFeatured", "isNewRelease", "isFree", "isBundle")
         VALUES ($1,$2,$3,$4,$5,'published',$6,$7,$8,$9,$10,$11,$12,$13,$14,false) RETURNING id`,
        [slug, name, tagline, description, categoryId, basePrice, compareAtPrice, coverUrl, coverUrl, [fileKey.split(".").pop()], tags, isFeatured, isNewRelease, isFree],
      )
      const productId = r.rows[0].id
      productCount++

      if (coverUrl) {
        await client.query(`INSERT INTO product_images ("productId", url, alt, "sortOrder") VALUES ($1,$2,$3,0)`, [productId, coverUrl, name])
      }

      if (isFree) {
        await client.query(
          `INSERT INTO product_licenses ("productId", "licenseType", price, description, "sortOrder") VALUES ($1,'personal',0,'Free for personal and commercial use.',0)`,
          [productId],
        )
      } else {
        for (let i = 0; i < licenseTiers.length; i++) {
          const t = licenseTiers[i]
          const price = Math.round(basePrice * t.mult * 100) / 100
          await client.query(
            `INSERT INTO product_licenses ("productId", "licenseType", price, description, "sortOrder") VALUES ($1,$2,$3,$4,$5)`,
            [productId, t.licenseType, price, t.description, i],
          )
        }
      }

      if (f) {
        await client.query(
          `INSERT INTO product_files ("productId", "fileName", "blobPathname", "fileType", "sortOrder") VALUES ($1,$2,$3,$4,0)`,
          [productId, f.fileName, f.blobPathname, f.fileName.split(".").pop()],
        )
      }

      // Seed 1-2 reviews per product for rating aggregates
      const numReviews = isFeatured ? 2 : 1
      for (let i = 0; i < numReviews; i++) {
        const rv = reviewSeeds[(productId + i) % reviewSeeds.length]
        await client.query(
          `INSERT INTO reviews ("productId", "userId", rating, title, body) VALUES ($1,$2,$3,$4,$5)`,
          [productId, adminUserId, rv.rating, rv.title, rv.body],
        )
      }
    }
    console.log("[v0] Inserted products:", productCount)

    for (const b of bundles) {
      const [slug, name, tagline, description, catSlug, basePrice, compareAtPrice, isFeatured, isNewRelease, isFree, imageKey, includedSlugs] = b
      const categoryId = categoryIdBySlug[catSlug]
      const coverUrl = img(imageKey)
      const r = await client.query(
        `INSERT INTO products (slug, name, tagline, description, "categoryId", status, "basePrice", "compareAtPrice", "thumbnailUrl", "coverImageUrl", "fileFormats", tags, "isFeatured", "isNewRelease", "isFree", "isBundle")
         VALUES ($1,$2,$3,$4,$5,'published',$6,$7,$8,$9,$10,$11,$12,$13,$14,true) RETURNING id`,
        [slug, name, tagline, description, categoryId, basePrice, compareAtPrice, coverUrl, coverUrl, ["zip"], ["bundle"], isFeatured, isNewRelease, isFree],
      )
      const bundleProductId = r.rows[0].id

      if (coverUrl) {
        await client.query(`INSERT INTO product_images ("productId", url, alt, "sortOrder") VALUES ($1,$2,$3,0)`, [bundleProductId, coverUrl, name])
      }

      for (let i = 0; i < licenseTiers.length; i++) {
        const t = licenseTiers[i]
        const price = Math.round(basePrice * t.mult * 100) / 100
        await client.query(
          `INSERT INTO product_licenses ("productId", "licenseType", price, description, "sortOrder") VALUES ($1,$2,$3,$4,$5)`,
          [bundleProductId, t.licenseType, price, t.description, i],
        )
      }

      for (const includedSlug of includedSlugs) {
        const inc = await client.query(`SELECT id FROM products WHERE slug = $1`, [includedSlug])
        if (inc.rows[0]) {
          await client.query(
            `INSERT INTO bundle_items ("bundleProductId", "includedProductId") VALUES ($1,$2)`,
            [bundleProductId, inc.rows[0].id],
          )
        }
      }

      const rv = reviewSeeds[0]
      await client.query(
        `INSERT INTO reviews ("productId", "userId", rating, title, body) VALUES ($1,$2,$3,$4,$5)`,
        [bundleProductId, adminUserId, rv.rating, rv.title, rv.body],
      )
    }
    console.log("[v0] Inserted bundles:", bundles.length)

    await client.query("COMMIT")
    console.log("[v0] Seed complete.")
  } catch (err) {
    await client.query("ROLLBACK")
    console.error("[v0] Seed failed, rolled back:", err)
    process.exitCode = 1
  } finally {
    client.release()
    await pool.end()
  }
}

main()
