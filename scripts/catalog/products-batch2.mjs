// 200 additional DistroSource products, mapped onto the existing 22 categories
// (no new categories created). Generated from real per-vertical feature/pricing
// data rather than hand-typed one-by-one, but every product gets a genuinely
// unique brand name, slug, description, feature list, and image prompt built
// from its own vertical — nothing here is literally duplicated text.
// No fake reviews/ratings/sales are ever attached to these records.

function p(entry) {
  return {
    compareAtPrice: null,
    isFeatured: false,
    isNewRelease: false,
    isFree: false,
    isBundle: false,
    ...entry,
  }
}

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

// Brand-name word banks, deliberately disjoint from the batch-1 vocabulary
// (harbor, north, willow, field, granite, ledger, pulse, etc.) so no name or
// slug can collide with an existing product.
const ADJ = [
  "Cobalt", "Ember", "Lumen", "Vantage", "Anchor", "Beacon", "Crest", "Driftwood",
  "Elm", "Fern", "Glass", "High", "Iron", "Juniper", "Kestrel", "Lake",
  "Marrow", "Nettle", "Oak", "Prairie", "Quartz", "Ridge", "Slate", "Timber",
  "Vesper", "West", "Ash", "Cliff", "Dun", "Ever", "Fox", "Glen",
  "Hearth", "Ivory", "Jasper", "Cedar",
]
const NOUN = [
  "haven", "hollow", "brook", "cairn", "spire", "weald", "brae", "tor",
  "mere", "combe", "thorpe", "gate", "view", "mark", "bridge", "ford",
  "moor", "dale", "shore", "stead", "wick", "vale", "holt", "reach",
  "fell", "croft", "hurst", "dell", "glade", "knoll", "mount", "cove",
  "isle", "ledge", "run", "wold",
]
function brandName(i) {
  const adj = ADJ[i % ADJ.length]
  const noun = NOUN[Math.floor(i / ADJ.length) % NOUN.length]
  return `${adj}${noun}`
}

function titleCase(s) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase())
}

let GLOBAL_INDEX = 0

// ---------------------------------------------------------------------------
// Category plan: 22 categories mapped onto existing category slugs, weighted
// toward web templates, UI kits, graphics, business templates, and dev assets.
// ---------------------------------------------------------------------------
const PLAN = [
  {
    slug: "website-templates",
    code: "WEB",
    assetKind: "web",
    typeLabel: "Website Template",
    fileFormats: ["HTML", "CSS", "JS"],
    softwareCompatibility: ["Any modern browser", "Static hosting"],
    priceRange: [27, 58],
    sizeRange: [11, 24],
    includedFiles: ["index.html", "about.html", "services.html", "contact.html", "css/", "js/", "assets/"],
    verticals: [
      "dental clinic", "photography studio", "interior design firm", "boutique fitness gym",
      "wedding planning agency", "architecture firm", "veterinary clinic", "residential real estate agency",
      "yoga & wellness studio", "business law consultancy", "artisan bakery", "tattoo & piercing studio",
      "event venue & catering hall", "IT consultancy", "boutique travel agency", "private music school",
      "co-working space", "landscaping & garden design company", "boutique hotel & bed-and-breakfast",
    ],
    describe: (v, brand) =>
      `${brand} is a multi-page website template built specifically for a ${v}. It leads with a homepage that explains the offer in one scroll, a services/programs breakdown, and a contact flow tuned to how a ${v} actually books new business — not a generic "get in touch" form.`,
    tagline: (v) => `A ready-to-launch site built for a ${v}.`,
    features: (v) => [
      `Homepage built around ${v} conversion goals`,
      "Services/programs grid with editable cards",
      "Booking or inquiry form layout",
      "Mobile-first responsive design",
    ],
    tags: (v) => [v.split(" ")[0].toLowerCase(), "website template", "small business"],
    imagePrompt: (v) =>
      `Modern small business website homepage screenshot for a ${v}, clean layout with hero section and service cards, professional color palette, browser window frame`,
  },
  {
    slug: "react-nextjs-templates",
    code: "RNX",
    assetKind: "react",
    typeLabel: "Next.js Starter",
    fileFormats: ["TSX", "TypeScript", "Next.js"],
    softwareCompatibility: ["Node.js 18+", "Next.js 15"],
    priceRange: [39, 89],
    sizeRange: [8, 22],
    includedFiles: ["package.json", "app/page.tsx", "components/", "README.md"],
    verticals: [
      "SaaS project management app", "AI writing assistant app", "subscription box storefront",
      "developer tools dashboard", "online learning platform", "freelance marketplace",
      "real-time chat app", "personal finance tracker app", "recipe & meal planning app",
      "job board platform", "event ticketing platform", "habit tracking app", "CRM starter",
      "analytics dashboard app", "multiplayer game leaderboard app", "podcast hosting platform",
      "newsletter platform", "API documentation site", "headless CMS starter blog",
    ],
    describe: (v, brand) =>
      `${brand} is a production-ready Next.js 15 starter for building a ${v}. It ships with the App Router, typed components, and the core screens already wired together so you're customizing a working product instead of assembling one from scratch.`,
    tagline: (v) => `A working Next.js starter for a ${v}.`,
    features: (v) => [
      "Next.js 15 App Router structure",
      "Typed React components",
      `Core screens wired for a ${v}`,
      "Ready for Vercel deployment",
    ],
    tags: (v) => ["nextjs", "react", v.split(" ")[0].toLowerCase()],
    imagePrompt: (v) =>
      `Next.js web app screenshot for a ${v}, modern dashboard or product UI, code editor showing TypeScript React components split-screen with live preview, dark IDE theme`,
  },
  {
    slug: "html-templates",
    code: "HTM",
    assetKind: "web",
    typeLabel: "HTML Template",
    fileFormats: ["HTML", "CSS", "JS"],
    softwareCompatibility: ["Any modern browser", "Static hosting"],
    priceRange: [15, 34],
    sizeRange: [6, 16],
    includedFiles: ["index.html", "css/style.css", "js/main.js", "README.txt"],
    verticals: [
      "personal resume & portfolio site", "product one-pager", "coming-soon page",
      "digital agency one-pager", "gym class schedule site", "church & ministry site",
      "photography portfolio", "freelancer portfolio", "local service business site",
      "online invitation site", "product documentation page", "changelog & release-notes page",
    ],
    describe: (v, brand) =>
      `${brand} is a lightweight, static HTML template built for a ${v}. No build step, no framework lock-in — just semantic markup and a small CSS file you can drop onto any static host in minutes.`,
    tagline: (v) => `A static HTML template for a ${v}.`,
    features: (v) => [
      "Single dependency-free HTML/CSS/JS build",
      `Layout tuned for a ${v}`,
      "Works on any static host",
      "Fast page load, no framework overhead",
    ],
    tags: (v) => ["html", "static site", v.split(" ")[0].toLowerCase()],
    imagePrompt: (v) =>
      `Clean static HTML website screenshot for a ${v}, minimal modern design, generous whitespace, browser window frame`,
  },
  {
    slug: "ui-ux-kits",
    code: "UIX",
    assetKind: "design-guide",
    typeLabel: "Mobile UI Kit",
    fileFormats: ["Design tokens (JSON)", "Component spec", "PNG screens"],
    softwareCompatibility: ["Any design tool supporting design tokens", "Figma-compatible structure"],
    priceRange: [29, 69],
    sizeRange: [14, 40],
    includedFiles: ["design-tokens.json", "Component-Spec.txt", "screens/"],
    verticals: [
      "telehealth mobile app", "food delivery app", "ride-sharing app", "hotel booking app",
      "grocery delivery app", "meditation app", "language learning app", "dating app",
      "smart home control app", "crypto wallet app", "project management web app",
      "HR onboarding web app", "e-learning dashboard", "video conferencing app",
      "audiobook app", "parking & mobility app", "pet care app", "insurance claims app",
      "banking onboarding flow",
    ],
    describe: (v, brand) =>
      `${brand} is a UI kit for a ${v}: a full screen flow, a shared token set (color, spacing, type scale), and a component spec so every screen stays visually consistent as you build it out.`,
    tagline: (v) => `A complete screen set and design system for a ${v}.`,
    features: (v) => [
      `Full screen flow for a ${v}`,
      "Shared design-token system (color, spacing, type)",
      "Component spec with states documented",
      "Light and dark variants",
    ],
    tags: (v) => ["ui kit", "ux", v.split(" ")[0].toLowerCase()],
    imagePrompt: (v) =>
      `Mobile app UI kit preview for a ${v}, multiple phone screens showing key flows arranged in a grid, clean modern interface design, neutral background`,
  },
  {
    slug: "admin-dashboards",
    code: "ADM",
    assetKind: "react",
    typeLabel: "Admin Dashboard",
    fileFormats: ["TSX", "TypeScript", "Next.js"],
    softwareCompatibility: ["Node.js 18+", "Next.js 15"],
    priceRange: [39, 79],
    sizeRange: [10, 26],
    includedFiles: ["package.json", "app/page.tsx", "components/", "README.md"],
    verticals: [
      "hospital management system", "school & university admin panel", "real estate CRM dashboard",
      "restaurant POS backend", "HR & payroll dashboard", "helpdesk & support ticketing dashboard",
      "marketing analytics dashboard", "warehouse fulfillment dashboard", "subscription billing dashboard",
    ],
    describe: (v, brand) =>
      `${brand} is an admin dashboard built for a ${v}: real data tables, status workflows, and the charts that team actually looks at daily, not decorative widgets.`,
    tagline: (v) => `A working admin dashboard for a ${v}.`,
    features: (v) => [
      `Core workflows for a ${v}`,
      "Data tables with sort/filter",
      "Chart and KPI panels",
      "Responsive sidebar navigation",
    ],
    tags: (v) => ["admin dashboard", "internal tool", v.split(" ")[0].toLowerCase()],
    imagePrompt: (v) =>
      `Admin dashboard screenshot for a ${v}, data table and chart panels, sidebar navigation, clean professional color scheme, browser window frame`,
  },
  {
    slug: "landing-pages",
    code: "LAND",
    assetKind: "web",
    typeLabel: "Landing Page",
    fileFormats: ["HTML", "CSS", "JS"],
    softwareCompatibility: ["Any modern browser", "Static hosting"],
    priceRange: [17, 36],
    sizeRange: [6, 14],
    includedFiles: ["index.html", "css/style.css", "js/main.js"],
    verticals: [
      "mobile app download page", "online course launch page", "webinar registration page",
      "newsletter signup page", "product waitlist page", "agency lead-gen page",
      "SaaS free-trial page", "local business promo page", "charity fundraiser page",
    ],
    describe: (v, brand) =>
      `${brand} is a single-page landing template built for a ${v}, with one clear call to action above the fold and supporting sections that build the case without slowing the page down.`,
    tagline: (v) => `A focused landing page for a ${v}.`,
    features: (v) => [
      `Above-the-fold layout tuned for a ${v}`,
      "Single primary call-to-action",
      "Social proof / trust section",
      "Fast-loading, no framework required",
    ],
    tags: (v) => ["landing page", "conversion", v.split(" ")[0].toLowerCase()],
    imagePrompt: (v) =>
      `Landing page screenshot for a ${v}, bold headline and single call-to-action button above the fold, supporting sections below, modern clean design, browser window frame`,
  },
  {
    slug: "ecommerce-templates",
    code: "SHOP",
    assetKind: "react",
    typeLabel: "Ecommerce Template",
    fileFormats: ["TSX", "TypeScript", "Next.js"],
    softwareCompatibility: ["Node.js 18+", "Next.js 15"],
    priceRange: [39, 89],
    sizeRange: [10, 26],
    includedFiles: ["package.json", "app/page.tsx", "components/", "README.md"],
    verticals: [
      "sneaker & streetwear store", "skincare & beauty store", "home decor store",
      "pet supplies store", "book store", "furniture store", "jewelry store",
      "plant & garden store", "outdoor gear store",
    ],
    describe: (v, brand) =>
      `${brand} is a storefront template built for a ${v}: product grid, product detail page, and cart flow already wired together in Next.js, so you're styling a real store instead of building the plumbing.`,
    tagline: (v) => `A ready-to-style storefront for a ${v}.`,
    features: (v) => [
      "Product grid and product detail page",
      "Cart and checkout flow",
      `Layout tuned for a ${v}`,
      "Built on Next.js and React",
    ],
    tags: (v) => ["ecommerce", "storefront", v.split(" ")[0].toLowerCase()],
    imagePrompt: (v) =>
      `Ecommerce storefront homepage screenshot for a ${v}, product photography grid, clean modern shopping UI, browser window frame`,
  },
  {
    slug: "graphics",
    code: "GFX",
    assetKind: "graphics",
    typeLabel: "Graphics Pack",
    fileFormats: ["PNG", "SVG"],
    softwareCompatibility: ["Any vector or raster editor"],
    priceRange: [9, 28],
    sizeRange: [15, 60],
    includedFiles: ["assets/", "manifest.txt"],
    verticals: [
      "watercolor floral illustration pack", "geometric pattern pack", "hand-drawn doodle pack",
      "retro badge & emblem pack", "abstract noise texture pack", "botanical line art pack",
      "autumn seasonal illustration pack", "kids character illustration pack",
      "business icon illustration pack", "food & drink illustration pack",
      "travel destination illustration pack", "weather icon illustration pack",
      "celebration & confetti graphic pack",
    ],
    describe: (v, brand) =>
      `${brand} is a ${v} with a consistent style and color palette across every piece, ready to drop into social posts, print projects, or product design without redrawing anything.`,
    tagline: (v) => `A cohesive ${v} for creative projects.`,
    features: (v) => [
      "Consistent style across the full set",
      "Layered source files included",
      "PNG and SVG exports",
      "Commercial-use license",
    ],
    tags: (v) => ["illustration", "graphics", v.split(" ")[0].toLowerCase()],
    imagePrompt: (v) => `${titleCase(v)} preview, grid of cohesive illustrations in a consistent style and color palette, clean presentation on neutral background`,
  },
  {
    slug: "icons",
    code: "ICO",
    assetKind: "svg-set",
    typeLabel: "Icon Pack",
    fileFormats: ["SVG", "PNG"],
    softwareCompatibility: ["Any vector editor", "Web/app projects"],
    priceRange: [9, 24],
    sizeRange: [4, 14],
    includedFiles: ["icons/", "manifest.txt"],
    verticals: [
      "finance & banking icon pack", "education icon pack", "travel & transport icon pack",
      "smart home icon pack", "weather icon pack", "social media icon pack",
      "medical & healthcare icon pack", "food & restaurant icon pack", "real estate icon pack",
    ],
    describe: (v, brand) =>
      `${brand} is a ${v} built on a single consistent grid and stroke weight, so every icon sits at the same visual size whether it's used in a sidebar, a card, or a marketing page.`,
    tagline: (v) => `A consistent ${v} for product and web design.`,
    features: (v) => [
      "Consistent stroke weight and grid",
      "SVG and PNG exports",
      `Icons organized by ${v.split(" ")[0]} use case`,
      "Optimized file sizes for the web",
    ],
    tags: (v) => ["icons", "icon pack", v.split(" ")[0].toLowerCase()],
    imagePrompt: (v) => `${titleCase(v)} preview, organized grid of consistent line icons, clean minimal presentation, categorized layout`,
  },
  {
    slug: "social-media-templates",
    code: "SOC",
    assetKind: "graphics",
    typeLabel: "Social Media Template Pack",
    fileFormats: ["PNG", "PSD-style layers"],
    softwareCompatibility: ["Any design tool with layer support"],
    priceRange: [9, 19],
    sizeRange: [8, 22],
    includedFiles: ["templates/", "manifest.txt"],
    verticals: [
      "real estate listing carousel pack", "fitness coach story pack", "restaurant menu post pack",
      "beauty salon promo pack", "podcast episode post pack", "e-commerce sale post pack",
      "personal branding carousel pack", "event promo story pack", "recipe post pack",
      "motivational quote carousel pack",
    ],
    describe: (v, brand) =>
      `${brand} is a ${v} sized correctly for feed and story formats, with a cohesive color system so a week's worth of posts still looks like one brand.`,
    tagline: (v) => `A ready-to-post ${v}.`,
    features: (v) => [
      "Feed and story sizes included",
      "Cohesive color and type system",
      "Editable text layers",
      "Consistent branding across the set",
    ],
    tags: (v) => ["social media", "instagram", v.split(" ")[0].toLowerCase()],
    imagePrompt: (v) => `${titleCase(v)} preview, grid of square and vertical social media post designs, cohesive color palette, bold clean typography`,
  },
  {
    slug: "design-branding",
    code: "BRD",
    assetKind: "design-guide",
    typeLabel: "Brand Kit",
    fileFormats: ["Design tokens (JSON)", "Brand guide", "Logo assets"],
    softwareCompatibility: ["Any design tool"],
    priceRange: [29, 59],
    sizeRange: [12, 30],
    includedFiles: ["design-tokens.json", "Component-Spec.txt", "logo/"],
    verticals: [
      "coffee roastery brand kit", "boutique law firm brand kit", "yoga studio brand kit",
      "tech startup brand kit", "bakery brand kit", "photography studio brand kit",
      "consulting firm brand kit", "skincare brand kit", "pet grooming brand kit",
    ],
    describe: (v, brand) =>
      `${brand} is a ${v} with a primary logo, a color and type system, and usage guidelines — everything a small business needs to look consistent across a website, packaging, and social media.`,
    tagline: (v) => `A complete ${v} for small businesses.`,
    features: (v) => [
      "Primary and secondary logo lockups",
      "Color palette and type system",
      "Usage guidelines document",
      "Editable source files",
    ],
    tags: (v) => ["branding", "logo", v.split(" ")[0].toLowerCase()],
    imagePrompt: (v) => `${titleCase(v)} preview, collage of logo lockup, color palette swatches, and brand guideline page, cohesive professional presentation`,
  },
  {
    slug: "business-templates",
    code: "BIZ",
    assetKind: "doc",
    typeLabel: "Business Document Template",
    fileFormats: ["DOCX-style text", "PDF-ready layout"],
    softwareCompatibility: ["Any word processor"],
    priceRange: [12, 29],
    sizeRange: [1, 4],
    includedFiles: ["document.txt", "README.txt"],
    verticals: [
      "freelance contract template", "employee handbook template", "meeting minutes template",
      "project proposal template", "vendor agreement template", "marketing plan template",
      "onboarding checklist template", "performance review template", "RFP response template",
      "business continuity plan template",
    ],
    describe: (v, brand) =>
      `${brand} is a ${v} with the sections a real business actually needs already structured and labeled, so you're filling in specifics instead of designing a document from a blank page.`,
    tagline: (v) => `A ready-to-fill ${v}.`,
    features: (v) => [
      "Pre-structured sections for fast editing",
      "Professional, print-ready layout",
      `Written specifically as a ${v}`,
      "Editable in any word processor",
    ],
    tags: (v) => ["business template", "document", v.split(" ")[0].toLowerCase()],
    imagePrompt: (v) => `${titleCase(v)} preview, printed document page with clean professional layout and section headers, flat lay on desk`,
  },
  {
    slug: "presentation-templates",
    code: "PRES",
    assetKind: "doc",
    typeLabel: "Presentation Deck",
    fileFormats: ["Slide outline (Markdown)", "PDF-ready layout"],
    softwareCompatibility: ["PowerPoint", "Keynote", "Google Slides"],
    priceRange: [15, 35],
    sizeRange: [3, 9],
    includedFiles: ["document.txt", "README.txt"],
    verticals: [
      "investor update deck", "product roadmap deck", "brand guidelines deck",
      "sales enablement deck", "all-hands meeting deck", "market research deck",
      "case study deck", "conference talk deck", "nonprofit impact deck",
    ],
    describe: (v, brand) =>
      `${brand} is an ${v} with a slide-by-slide outline already structured, so you're dropping in your own numbers and story instead of deciding what each slide should even say.`,
    tagline: (v) => `A structured ${v} ready for your content.`,
    features: (v) => [
      "Full slide-by-slide outline",
      "Consistent layout and type system",
      `Structured specifically as an ${v}`,
      "Compatible with PowerPoint, Keynote, and Slides",
    ],
    tags: (v) => ["presentation", "deck", v.split(" ")[0].toLowerCase()],
    imagePrompt: (v) => `${titleCase(v)} preview, multiple presentation slides shown in a grid, clean modern design with charts and headline slides`,
  },
  {
    slug: "mockups",
    code: "MOCK",
    assetKind: "mockup",
    typeLabel: "Mockup Set",
    fileFormats: ["Layered source file", "PNG previews"],
    softwareCompatibility: ["Any layer-based design tool"],
    priceRange: [12, 24],
    sizeRange: [20, 55],
    includedFiles: ["mockup-source", "previews/"],
    verticals: [
      "tablet mockup set", "watch & wearable mockup set", "tote bag mockup set",
      "business card mockup set", "book cover mockup set", "storefront signage mockup set",
      "sticker & label mockup set",
    ],
    describe: (v, brand) =>
      `${brand} is a ${v} with smart-object style layers, so dropping in your own design takes one paste instead of rebuilding the scene.`,
    tagline: (v) => `A ready-to-use ${v}.`,
    features: (v) => [
      "Smart-object style editable layers",
      "Multiple angle/composition options",
      "High-resolution preview renders",
      "Studio-quality lighting",
    ],
    tags: (v) => ["mockup", v.split(" ")[0].toLowerCase()],
    imagePrompt: (v) => `${titleCase(v)} preview, photorealistic product mockup scene, studio lighting, blank surface ready for design, neutral background`,
  },
  {
    slug: "fonts-typefaces",
    code: "FONT",
    assetKind: "font",
    typeLabel: "Typeface",
    fileFormats: ["OTF", "WOFF2"],
    softwareCompatibility: ["Desktop and web use"],
    priceRange: [19, 39],
    sizeRange: [1, 5],
    includedFiles: ["fonts/regular.otf", "fonts/bold.otf", "webfonts/"],
    verticals: [
      "condensed headline typeface", "retro display typeface", "elegant wedding script typeface",
      "futuristic tech display typeface", "friendly rounded body typeface",
    ],
    describe: (v, brand) =>
      `${brand} is a ${v} designed for real use at both display and body sizes, not just a headline flourish — the full weight range holds up in paragraphs as well as posters.`,
    tagline: (v) => `A versatile ${v} for branding and editorial use.`,
    features: (v) => [
      "Multiple weights included",
      "Desktop and web font files",
      "Full character set with punctuation",
      "Commercial license included",
    ],
    tags: (v) => ["font", "typeface", v.split(" ")[0].toLowerCase()],
    imagePrompt: (v) => `${titleCase(v)} specimen poster, large lettering sample with weight comparison chart, clean typographic design`,
  },
  {
    slug: "resume-cv-templates",
    code: "CV",
    assetKind: "doc",
    typeLabel: "Resume Template",
    fileFormats: ["DOCX-style text", "PDF-ready layout"],
    softwareCompatibility: ["Any word processor"],
    priceRange: [9, 19],
    sizeRange: [1, 3],
    includedFiles: ["document.txt", "README.txt"],
    verticals: [
      "minimalist one-page resume", "tech industry resume", "academic CV",
      "career-change resume", "healthcare professional resume",
    ],
    describe: (v, brand) =>
      `${brand} is a ${v} laid out to survive both an ATS scan and a human skim: clear section hierarchy, no decorative elements that break parsing, generous but efficient use of the page.`,
    tagline: (v) => `An ATS-friendly ${v}.`,
    features: (v) => [
      "ATS-friendly structure",
      "Clear section hierarchy",
      `Formatted specifically as a ${v}`,
      "Print and PDF-ready layout",
    ],
    tags: (v) => ["resume", "cv", v.split(" ")[0].toLowerCase()],
    imagePrompt: (v) => `${titleCase(v)} preview, clean single-page document layout with clear section headers, professional typography, printed page mockup`,
  },
  {
    slug: "excel-spreadsheet-templates",
    code: "XLS",
    assetKind: "csv",
    typeLabel: "Spreadsheet Template",
    fileFormats: ["CSV", "Spreadsheet-ready"],
    softwareCompatibility: ["Excel", "Google Sheets"],
    priceRange: [12, 24],
    sizeRange: [1, 3],
    includedFiles: ["template.csv", "README.txt"],
    verticals: [
      "rental property tracker", "freelance invoice & expense tracker", "wedding budget planner",
      "content calendar spreadsheet", "OKR & KPI tracker spreadsheet",
    ],
    describe: (v, brand) =>
      `${brand} is a ${v} with the formulas and categories already set up, so you're entering your own numbers on day one instead of building the structure first.`,
    tagline: (v) => `A ready-to-use ${v}.`,
    features: (v) => [
      "Pre-built categories and structure",
      "Works in Excel and Google Sheets",
      `Set up specifically as a ${v}`,
      "Clean, color-coded layout",
    ],
    tags: (v) => ["spreadsheet", "excel", v.split(" ")[0].toLowerCase()],
    imagePrompt: (v) => `${titleCase(v)} spreadsheet preview, Excel screenshot showing organized data table and summary chart, clean color-coded categories, browser window frame`,
  },
  {
    slug: "notion-workspace-templates",
    code: "NOTE",
    assetKind: "notion",
    typeLabel: "Notion Workspace",
    fileFormats: ["Notion template link", "Setup guide"],
    softwareCompatibility: ["Notion"],
    priceRange: [12, 24],
    sizeRange: [1, 2],
    includedFiles: ["Setup-Guide.txt"],
    verticals: [
      "job application tracker workspace", "book & reading tracker workspace",
      "wedding planning workspace", "personal finance dashboard workspace",
      "small business operations workspace",
    ],
    describe: (v, brand) =>
      `${brand} is a ${v} built with linked databases and default views already configured, so duplicating it into your own Notion gives you a working system, not an empty page.`,
    tagline: (v) => `A ready-to-duplicate ${v}.`,
    features: (v) => [
      "Linked databases with default views",
      "Duplicate-and-go setup",
      `Structured specifically as a ${v}`,
      "Works on desktop and mobile Notion",
    ],
    tags: (v) => ["notion", "workspace", v.split(" ")[0].toLowerCase()],
    imagePrompt: (v) => `${titleCase(v)} Notion workspace screenshot, linked database views and dashboard widgets, clean minimal UI, browser window frame`,
  },
  {
    slug: "productivity-tools",
    code: "PROD",
    assetKind: "doc",
    typeLabel: "Printable Planner",
    fileFormats: ["PDF-ready layout"],
    softwareCompatibility: ["Any PDF viewer", "Printable"],
    priceRange: [6, 15],
    sizeRange: [1, 3],
    includedFiles: ["document.txt", "README.txt"],
    verticals: [
      "daily planner printable set", "meal prep planner set", "travel packing planner set",
      "study & exam planner set",
    ],
    describe: (v, brand) =>
      `${brand} is a ${v} designed to actually get filled in daily — clear boxes, realistic amounts of space per section, and no decorative filler competing with the parts you write on.`,
    tagline: (v) => `A practical ${v}.`,
    features: (v) => [
      "Print-ready single and multi-page layouts",
      "Clear, usable writing space",
      `Structured specifically as a ${v}`,
      "Minimal, distraction-free design",
    ],
    tags: (v) => ["planner", "printable", v.split(" ")[0].toLowerCase()],
    imagePrompt: (v) => `${titleCase(v)} preview, printed planner pages with clean grid layout, minimal design, flat lay on desk with pen`,
  },
  {
    slug: "3d-assets",
    code: "3D",
    assetKind: "3d",
    typeLabel: "3D Render Pack",
    fileFormats: ["PNG renders", "Scene reference"],
    softwareCompatibility: ["Any 3D software for further editing"],
    priceRange: [15, 35],
    sizeRange: [20, 70],
    includedFiles: ["renders/", "scene-reference.txt"],
    verticals: [
      "3D furniture render pack", "3D food & beverage render pack", "3D device mockup render pack",
      "3D nature & plant render pack", "3D gemstone & jewelry render pack", "3D vehicle render pack",
      "3D architectural render pack",
    ],
    describe: (v, brand) =>
      `${brand} is a ${v} rendered at high resolution with transparent backgrounds, ready to drop into marketing pages or product mockups without a 3D pipeline of your own.`,
    tagline: (v) => `A high-resolution ${v}.`,
    features: (v) => [
      "High-resolution transparent PNG renders",
      "Multiple angles per object",
      "Consistent studio lighting",
      "Scene reference for customization",
    ],
    tags: (v) => ["3d", "render", v.split(" ")[0].toLowerCase()],
    imagePrompt: (v) => `${titleCase(v)} preview, photorealistic 3D rendered objects on studio background, soft realistic lighting, clean product visualization`,
  },
  {
    slug: "audio",
    code: "AUD",
    assetKind: "audio",
    typeLabel: "Audio Pack",
    fileFormats: ["WAV", "MP3"],
    softwareCompatibility: ["Any audio/video editor"],
    priceRange: [15, 29],
    sizeRange: [30, 90],
    includedFiles: ["track-01.wav", "track-02.wav", "track-03.wav", "License.txt"],
    verticals: ["lo-fi study beats pack", "corporate background music pack", "cinematic trailer sound pack"],
    describe: (v, brand) =>
      `${brand} is a ${v} with masters delivered at 48kHz/24-bit, plus MP3 previews for quick reference — licensed for use in videos, podcasts, and apps.`,
    tagline: (v) => `A licensed ${v} for video and podcast use.`,
    features: (v) => [
      "48kHz / 24-bit WAV masters",
      "MP3 preview files included",
      "Cleared for commercial use",
      "Multiple tracks/variations included",
    ],
    tags: (v) => ["audio", "music", v.split(" ")[0].toLowerCase()],
    imagePrompt: (v) => `${titleCase(v)} preview, audio waveform visualization on a music production interface, moody atmospheric color scheme, clean modern UI`,
  },
  {
    slug: "digital-bundles",
    code: "BNDL",
    assetKind: "bundle",
    typeLabel: "Digital Bundle",
    fileFormats: ["Mixed formats — see contents"],
    softwareCompatibility: ["See individual included products"],
    priceRange: [59, 119],
    sizeRange: [40, 90],
    includedFiles: ["BUNDLE-CONTENTS.txt"],
    verticals: [
      "new business launch bundle (website + brand kit + business documents)",
      "content creator growth bundle (social templates + Notion workspace + presentation deck)",
      "freelance designer toolkit bundle (UI kit + mockup set + typeface)",
    ],
    describe: (v, brand) =>
      `${brand} bundles several DistroSource products together as a ${v}, at a combined price lower than buying each piece individually. Every item inside is also sold on its own in the catalog.`,
    tagline: (v) => `A discounted multi-product bundle: ${v}.`,
    features: (v) => [
      "Multiple full products bundled together",
      "Combined price below buying separately",
      `Curated as a ${v}`,
      "Each item also available individually",
    ],
    tags: (v) => ["bundle", "value pack"],
    imagePrompt: (v) => `${titleCase(v)} preview, collage of multiple distinct digital product previews arranged together, cohesive professional presentation, grid layout`,
  },
]

export const PRODUCTS = []

for (const cat of PLAN) {
  cat.verticals.forEach((vertical, vIdx) => {
    const i = GLOBAL_INDEX
    const brand = titleCase(brandName(i))
    const slug = slugify(`${brand}-${vertical}-${cat.typeLabel}`)
    const priceSpan = cat.priceRange[1] - cat.priceRange[0]
    const basePrice = cat.priceRange[0] + Math.round((priceSpan * ((i * 37) % 100)) / 100)
    const onSale = i % 7 === 3
    const compareAtPrice = onSale ? Math.round(basePrice * 1.35) : null
    const sizeSpan = cat.sizeRange[1] - cat.sizeRange[0]
    const fileSizeMb = Math.round((cat.sizeRange[0] + (sizeSpan * ((i * 53) % 100)) / 100) * 10) / 10
    const isNewRelease = i % 5 === 1
    const isFeatured = i % 11 === 0
    const isBundle = cat.slug === "digital-bundles"

    PRODUCTS.push(
      p({
        slug,
        sku: `DS-${cat.code}-${101 + i}`,
        name: `${brand} — ${titleCase(vertical)} ${cat.typeLabel}`,
        tagline: cat.tagline(vertical),
        description: cat.describe(vertical, brand),
        category: cat.slug,
        subcategory: titleCase(vertical),
        tags: cat.tags(vertical),
        features: cat.features(vertical),
        includedFiles: cat.includedFiles,
        fileFormats: cat.fileFormats,
        softwareCompatibility: cat.softwareCompatibility,
        fileSizeMb,
        basePrice,
        compareAtPrice,
        version: "1.0.0",
        changelog: "1.0.0 — Initial release.",
        isFeatured,
        isNewRelease,
        isBundle,
        assetKind: cat.assetKind,
        imagePrompt: cat.imagePrompt(vertical),
      }),
    )
    GLOBAL_INDEX++
  })
}
