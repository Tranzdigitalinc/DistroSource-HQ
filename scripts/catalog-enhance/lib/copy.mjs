/**
 * Per-archetype copy vocabulary.
 *
 * Each archetype supplies its own sentence shapes, feature pool, audience
 * list, workflow steps and customization points. Combined with the product's
 * real subject and a per-product seed, this produces copy that differs
 * meaningfully between products instead of one template with the noun swapped.
 *
 * WORDING RULES enforced here:
 *  - No "revolutionize", "unlock", "take it to the next level", "seamlessly",
 *    "game-changing", "supercharge".
 *  - Never asserts that a specific file exists in the download. Package
 *    contents are described as what the product is designed to include, and
 *    the product page renders an explicit note while final files are pending.
 */

export const BANNED = [
  "revolutionize", "unlock your", "next level", "seamlessly", "game-chang",
  "supercharge", "cutting-edge", "elevate your", "harness the power",
]

/**
 * `s` is the product subject (e.g. "language learning app").
 * Each entry returns strings; `pick` is the seeded chooser.
 */
export const ARCHETYPES = {
  "spreadsheet": {
    noun: "workbook",
    kind: "spreadsheet system",
    overview: (s, pick) => [
      pick([
        `This ${"workbook"} is built around ${s}. Figures are entered once on the data sheet and flow through to the summary views, so the totals, ratios and charts stay in step with whatever you type.`,
        `A spreadsheet system for ${s}. You keep entries in one place; the calculation sheets and summary views read from that single source, which keeps the numbers consistent as the file grows.`,
        `Designed for ${s}, this workbook separates raw entry from reporting. You maintain the input sheet, and the derived views recalculate from it rather than needing to be updated by hand.`,
      ]),
      pick([
        `The structure is intentionally plain: named ranges and readable formulas rather than macros, so the file opens and behaves the same in Excel, Google Sheets and LibreOffice.`,
        `It avoids macros and add-ins so the file stays portable between Excel, Google Sheets and LibreOffice, and so the formulas remain auditable by whoever inherits the file.`,
        `Formulas are written to be readable rather than clever, which matters when someone other than the author has to change a rate, add a row, or explain a number.`,
      ]),
    ],
    bestFor: (s) => [
      `Owners and managers who track ${s} in a spreadsheet rather than dedicated software`,
      `Bookkeepers and analysts who need an auditable file rather than a black box`,
      `Small teams standardising on one shared format`,
      `Anyone replacing an inherited spreadsheet that has grown unmanageable`,
    ],
    features: (s) => [
      "Single data-entry sheet feeding every downstream view",
      "Summary view with the headline figures for the period",
      "Month-over-month comparison with variance",
      "Category breakdown driven by the entries you record",
      "Charts that expand automatically as rows are added",
      "Named ranges throughout, so formulas stay readable",
      "Input validation on the fields that commonly get mistyped",
      "Print-ready summary layout sized to one page",
      "Settings sheet for labels, categories and rates",
      "No macros, so the file opens without security warnings",
      `Terminology matched to ${s}`,
      "Sample rows demonstrating the intended entry format",
    ],
    howToUse: (s) => [
      "Open the workbook and set your period, currency and categories on the settings sheet.",
      "Replace the sample rows with your own entries on the data sheet.",
      "Read the summary and chart views — they recalculate from your entries.",
      "Print or export the summary when you need to share it.",
    ],
    customization: (s) => [
      "Rename or add categories without breaking the summary formulas",
      "Change currency, date format and period labels in one place",
      "Add columns to the data sheet; totals extend down the table",
      "Restyle charts and headings to match your own branding",
    ],
    requirements: ["Excel 2016 or newer, Google Sheets, or LibreOffice Calc", "No add-ins, macros or internet connection required"],
  },

  "admin-dashboard": {
    noun: "dashboard template",
    kind: "admin interface",
    overview: (s, pick) => [
      pick([
        `An admin interface for ${s}, covering the screens an internal tool actually needs: a data table with filtering, detail and edit views, and the empty, loading and error states that usually get skipped.`,
        `This dashboard template covers ${s}. It is structured around the working screens of an internal tool — list, detail, create and edit — rather than a single attractive overview page.`,
        `Built for ${s}, the layout gives you a persistent navigation shell and a content area that handles dense tables without becoming unreadable at smaller widths.`,
      ]),
      pick([
        `Components are composed rather than one-off, so a table used on one screen behaves identically on the next.`,
        `Spacing, type scale and colour come from a shared token set, which keeps new screens consistent with the ones already built.`,
        `The chrome — navigation, headers, toolbars — is separated from page content so new routes inherit the layout without duplication.`,
      ]),
    ],
    bestFor: (s) => [
      `Teams building an internal tool for ${s}`,
      "Developers who want structure without adopting a whole framework",
      "Agencies producing a client-facing admin area on a fixed timeline",
      "Products that have outgrown a spreadsheet back office",
    ],
    features: (s) => [
      "Persistent sidebar and top bar with active-state navigation",
      "Data table with sorting, filtering and pagination patterns",
      "Detail and edit views wired to the list",
      "Empty, loading, error and no-results states",
      "Form layouts with inline validation styling",
      "Chart placements for summary metrics",
      "Responsive behaviour down to tablet widths",
      "Consistent spacing and type scale via shared tokens",
      "Dark and light surface treatments",
      "Modal, drawer and confirmation patterns",
      "Accessible focus states on interactive elements",
      `Screen set framed around ${s}`,
    ],
    howToUse: () => [
      "Install dependencies and start the development server.",
      "Point the data layer at your own API or database.",
      "Adjust tokens for colour, radius and type to match your brand.",
      "Duplicate an existing route as the starting point for new screens.",
    ],
    customization: () => [
      "Swap the token file to restyle every screen at once",
      "Replace the sample data source with your own endpoints",
      "Add or remove navigation sections without touching page code",
      "Adjust table density and column sets per screen",
    ],
    requirements: ["Node.js 18 or newer", "Familiarity with the framework the template targets"],
  },

  "react-template": {
    noun: "starter",
    kind: "application starter",
    overview: (s, pick) => [
      pick([
        `A React starter for ${s}, arranged so routing, layout and component structure are already decided and you can begin on the parts specific to your product.`,
        `This starter targets ${s}. The routing structure, shared layout and component conventions are in place, which removes the setup decisions that usually consume the first day of a project.`,
        `Built for ${s}, the project keeps presentational components separate from data access so either can be replaced without disturbing the other.`,
      ]),
      pick([
        `Styling uses utility classes with a small token layer, so visual changes are made in one file rather than across dozens of components.`,
        `Components are typed and composed, which keeps refactors safe as the surface area grows.`,
        `The file layout follows current framework conventions, so the project stays recognisable to any developer joining it later.`,
      ]),
    ],
    bestFor: (s) => [
      `Developers starting a ${s} project`,
      "Founders validating an idea before investing in custom design",
      "Agencies standardising their project setup",
      "Teams replacing an ageing front end incrementally",
    ],
    features: (s) => [
      "Routing and shared layout already configured",
      "Typed components throughout",
      "Utility-first styling with a small token layer",
      "Responsive page structures",
      "Reusable card, form and navigation components",
      "Loading and error boundaries",
      "SEO-ready document head handling",
      "Accessible interactive components",
      "Clear separation of data access and presentation",
      "Conventional file structure for the framework",
      `Page set relevant to ${s}`,
      "Production build configuration included",
    ],
    howToUse: () => [
      "Install dependencies and run the development server.",
      "Update the token and configuration files with your brand values.",
      "Replace the sample content and connect your data source.",
      "Deploy using the framework's standard production build.",
    ],
    customization: () => [
      "Restyle globally by editing the token layer",
      "Add routes following the existing folder convention",
      "Swap the data layer without touching presentational components",
      "Extend or replace individual components in isolation",
    ],
    requirements: ["Node.js 18 or newer", "Working knowledge of React"],
  },

  "website-template": {
    noun: "template",
    kind: "website template",
    overview: (s, pick) => [
      pick([
        `A website template for ${s}, covering the pages this kind of site normally needs rather than a single hero screen: the main landing page, interior content pages and the contact route.`,
        `This template is arranged for ${s}. Structure and hierarchy are already resolved, so the work left is replacing copy and imagery with your own.`,
        `Built for ${s}, the markup is semantic and the layout is responsive from small phones up to wide desktop widths.`,
      ]),
      pick([
        `Styling is kept in a single stylesheet with custom properties at the top, so colour and type changes happen in one place.`,
        `There is no build step and no framework dependency — the files open directly in a browser and deploy to any static host.`,
        `Sections are self-contained blocks, so a page can be reordered or trimmed without unpicking the stylesheet.`,
      ]),
    ],
    bestFor: (s) => [
      `Businesses in ${s} that need a credible site quickly`,
      "Freelancers delivering a small site on a fixed budget",
      "Anyone replacing a dated or unmaintained website",
      "Developers who want a clean structural starting point",
    ],
    features: (s) => [
      "Responsive layout from mobile through wide desktop",
      "Semantic, accessible HTML structure",
      "Reusable section blocks that can be reordered",
      "Navigation with mobile menu behaviour",
      "Contact section layout",
      "Custom properties for colour and type at the top of the stylesheet",
      "Readable class naming",
      "No build step or framework requirement",
      "Deployable to any static host",
      "Print-friendly base styles",
      `Content structure matched to ${s}`,
      "Fast first paint with minimal assets",
    ],
    howToUse: () => [
      "Open the template files in your editor.",
      "Edit the custom properties at the top of the stylesheet for colour and type.",
      "Replace the placeholder copy and imagery with your own.",
      "Upload the folder to any static host.",
    ],
    customization: () => [
      "Change the palette and type scale from the custom properties block",
      "Reorder, duplicate or remove page sections",
      "Adjust container widths and spacing rhythm",
      "Swap imagery without touching layout rules",
    ],
    requirements: ["Any modern browser", "A text editor for editing HTML and CSS"],
  },

  "ui-kit": {
    noun: "UI kit",
    kind: "design system",
    overview: (s, pick) => [
      pick([
        `A UI kit for ${s}: a connected screen flow plus the tokens and components those screens are built from, so the design stays consistent as it is extended.`,
        `This kit covers ${s}. Rather than isolated screens, it provides a flow that holds together, backed by a documented component set.`,
        `Built around ${s}, the kit separates tokens (colour, spacing, type) from components, which means a global restyle does not require touching every screen.`,
      ]),
      pick([
        `Component states are documented rather than implied, so handoff to development involves fewer questions.`,
        `Spacing follows a single scale, which is what keeps screens looking related once other people start adding to them.`,
        `Light and dark treatments are derived from the same token set instead of being maintained as separate files.`,
      ]),
    ],
    bestFor: (s) => [
      `Product teams designing ${s}`,
      "Designers who need a defensible starting structure rather than a blank canvas",
      "Developers who want a documented spec to build against",
      "Founders preparing a prototype for user testing",
    ],
    features: (s) => [
      "Connected screen flow rather than isolated mockups",
      "Design tokens for colour, spacing and type scale",
      "Component set with states documented",
      "Light and dark treatments from one token source",
      "Consistent grid and spacing rhythm",
      "Form, list and navigation patterns",
      "Empty and error state designs",
      "Typography scale with defined usage",
      "Iconography sizing conventions",
      "Layout specs suitable for developer handoff",
      `Screens framed around ${s}`,
      "Naming conventions carried through the file",
    ],
    howToUse: () => [
      "Open the kit and review the token definitions first.",
      "Adjust colour, type and spacing tokens to your brand.",
      "Assemble new screens from the existing components.",
      "Share the component spec with developers for handoff.",
    ],
    customization: () => [
      "Retheme every screen by editing the token set",
      "Extend the component library following the documented conventions",
      "Adjust the type scale without breaking layout rhythm",
      "Add screens using the existing grid and spacing rules",
    ],
    requirements: ["A design tool that supports components and shared styles"],
  },

  "presentation": {
    noun: "deck",
    kind: "presentation template",
    overview: (s, pick) => [
      pick([
        `A presentation template for ${s}, with slide layouts chosen for the parts of the story that are actually difficult: comparisons, numbers, and the summary at the end.`,
        `This deck is arranged for ${s}. Layouts are built on master slides, so restyling the deck does not mean editing every slide individually.`,
        `Built for ${s}, the template covers title, section, content, data and closing layouts in a consistent visual language.`,
      ]),
      pick([
        `Type sizes are set for room-scale legibility rather than looking dense on a laptop.`,
        `Charts use a restrained palette so the data stays readable when projected.`,
        `Placeholders are real layout placeholders, so replacing content keeps alignment intact.`,
      ]),
    ],
    bestFor: (s) => [
      `Anyone presenting on ${s}`,
      "Founders preparing an investor or client meeting",
      "Consultants producing recurring reports",
      "Teams standardising internal presentation formats",
    ],
    features: (s) => [
      "Title, section divider and closing layouts",
      "Content layouts for one, two and three columns",
      "Data slides with chart placements",
      "Comparison and timeline layouts",
      "Image-led layouts with caption positions",
      "Master slides so restyling is centralised",
      "Type scale sized for projection",
      "Restrained chart palette",
      "Consistent margins and safe areas",
      "Editable placeholders that preserve alignment",
      `Structure suited to ${s}`,
      "Widescreen aspect ratio",
    ],
    howToUse: () => [
      "Open the deck and set brand colour and fonts on the master slides.",
      "Duplicate the layout that fits each point you need to make.",
      "Replace placeholder text and charts with your own content.",
      "Present or export to PDF for distribution.",
    ],
    customization: () => [
      "Change colours and fonts once on the master",
      "Reorder or delete layouts you do not need",
      "Adjust chart styling to your own data conventions",
      "Add slides using existing layouts to stay consistent",
    ],
    requirements: ["PowerPoint, Keynote or Google Slides"],
  },

  "icon-pack": {
    noun: "icon set",
    kind: "icon library",
    overview: (s, pick) => [
      pick([
        `An icon set covering ${s}, drawn on one grid at a consistent stroke weight so icons sit together correctly in an interface.`,
        `This set addresses ${s}. Every glyph shares an optical size and stroke treatment, which is what stops an interface looking assembled from different sources.`,
        `Built for ${s}, the icons are supplied as vectors so they stay crisp at any size and can be recoloured directly.`,
      ]),
      pick([
        `Vectors use currentColor conventions where applicable, so icons inherit colour from surrounding text.`,
        `Each glyph is aligned to a shared pixel grid to keep edges sharp at common interface sizes.`,
        `Naming is predictable, which matters when the set is imported into a component library.`,
      ]),
    ],
    bestFor: (s) => [
      `Interfaces and materials covering ${s}`,
      "Product teams needing coverage beyond a generic icon library",
      "Designers assembling a consistent visual language",
      "Developers who want clean, importable vectors",
    ],
    features: (s) => [
      "Single grid and consistent stroke weight across the set",
      "Scalable vector format",
      "Predictable, searchable naming",
      "Aligned to common interface sizes",
      "Recolourable without editing paths",
      "Optically balanced rather than mechanically scaled",
      "Suitable for both light and dark surfaces",
      "Clean paths with no stray points",
      `Coverage focused on ${s}`,
      "Consistent corner and terminal treatment",
    ],
    howToUse: () => [
      "Import the vectors into your design tool or project.",
      "Set colour through fill or currentColor as appropriate.",
      "Place icons at the sizes the grid was drawn for.",
      "Extend the set following the documented stroke and grid rules.",
    ],
    customization: () => [
      "Recolour by changing fill or inheriting text colour",
      "Adjust stroke weight consistently across the set",
      "Export at any size without quality loss",
      "Combine glyphs to build composite marks",
    ],
    requirements: ["Any tool that can open SVG files"],
  },

  "font": {
    noun: "typeface",
    kind: "typeface",
    overview: (s, pick) => [
      pick([
        `A typeface designed for ${s}, with the spacing and proportions resolved for real text settings rather than for a specimen poster.`,
        `This typeface addresses ${s}. Metrics and kerning are set so paragraphs hold together at reading sizes, not only at display sizes.`,
        `Drawn for ${s}, the character set covers the punctuation and figures that practical typesetting actually requires.`,
      ]),
      pick([
        `Figures, punctuation and common accents are included so the face does not fall back to a substitute mid-sentence.`,
        `Vertical metrics are set consistently, which avoids clipping when the face is used on the web.`,
        `Letterfit is tuned so that setting the face at small sizes does not require manual tracking.`,
      ]),
    ],
    bestFor: (s) => [
      `Projects in ${s}`,
      "Brand systems needing a distinctive but workable voice",
      "Editorial and interface typography",
      "Designers who need dependable metrics rather than a novelty display face",
    ],
    features: (s) => [
      "Considered spacing and kerning for running text",
      "Full basic Latin character set",
      "Lining figures and standard punctuation",
      "Common accented characters",
      "Consistent vertical metrics",
      "Legible at both interface and display sizes",
      "Web-ready formats",
      "Balanced letterfit requiring minimal tracking",
      `Tone suited to ${s}`,
      "Clean outlines suitable for print and screen",
    ],
    howToUse: () => [
      "Install the desktop files, or self-host the web formats.",
      "Set the face at the sizes it was drawn for.",
      "Pair with a complementary face for contrast where needed.",
      "Check licence scope before using in a client or product context.",
    ],
    customization: () => [
      "Apply your own colour and sizing in any application",
      "Adjust tracking for display settings if desired",
      "Self-host web formats under the appropriate licence",
    ],
    requirements: ["A system or application that supports installing fonts"],
  },

  "document": {
    noun: "document set",
    kind: "business document",
    overview: (s, pick) => [
      pick([
        `An editable document set for ${s}, laid out with styles rather than manual formatting so it stays tidy when the text is replaced.`,
        `This set covers ${s}. Headings, tables and numbering use defined styles, which means edits do not gradually break the layout.`,
        `Prepared for ${s}, the structure follows the sections this kind of document is normally expected to contain.`,
      ]),
      pick([
        `Every field intended for replacement is marked, so nothing placeholder survives into a sent version.`,
        `Page setup, margins and numbering are configured for standard printing.`,
        `The wording is plain rather than ornate, which is what makes a business document easy to review.`,
      ]),
    ],
    bestFor: (s) => [
      `Businesses that regularly produce documents for ${s}`,
      "Freelancers formalising their client paperwork",
      "Small teams without in-house document design",
      "Anyone replacing an inconsistent set of ad-hoc files",
    ],
    features: (s) => [
      "Style-driven headings and body text",
      "Structured tables with consistent formatting",
      "Automatic numbering where appropriate",
      "Clearly marked replaceable fields",
      "Print-ready page setup and margins",
      "Header and footer with page numbering",
      "Consistent typographic hierarchy",
      "Sections ordered as this document type expects",
      `Language framed for ${s}`,
      "Exports cleanly to PDF",
    ],
    howToUse: () => [
      "Open the document and replace the marked fields with your own details.",
      "Adjust or remove sections that do not apply to your situation.",
      "Update the header and footer with your business identity.",
      "Export to PDF when the document is ready to send.",
    ],
    customization: () => [
      "Restyle globally by editing the document styles",
      "Add or remove sections without disturbing numbering",
      "Insert your logo and brand colours in the header",
    ],
    requirements: ["Microsoft Word, Google Docs or a compatible editor"],
    legalNote: true,
  },
}

/** Archetypes that borrow another's structure, with their own subject wording. */
export const ALIASES = {
  "ecommerce-template": "website-template",
  "landing-page": "website-template",
  "notion": "planner",
  "resume": "document",
  "planner": "spreadsheet",
  "social": "graphic",
  "branding": "graphic",
  "mockup": "graphic",
  "three-d": "graphic",
  "audio": "graphic",
  "preset": "graphic",
  "bundle": "graphic",
  "graphic": "graphic",
}

/** Generic fallback used by the visual/asset archetypes. */
ARCHETYPES.graphic = {
  noun: "asset pack",
  kind: "design asset",
  overview: (s, pick) => [
    pick([
      `A set of design assets for ${s}, prepared at working resolution and organised so the files are usable without cleanup.`,
      `This pack covers ${s}. Assets share a consistent treatment so they can be mixed within one project without looking mismatched.`,
      `Assembled for ${s}, the files are named predictably and grouped by type so the right asset is quick to find.`,
    ]),
    pick([
      `Formats are chosen for editability rather than convenience of export alone.`,
      `Layers and groups are named, which is what makes an asset pack pleasant to work with rather than merely usable.`,
      `Assets are supplied at sizes suitable for both screen and print use where the format allows.`,
    ]),
  ],
  bestFor: (s) => [
    `Projects involving ${s}`,
    "Designers who need a consistent set rather than assorted single files",
    "Marketing teams producing recurring material",
    "Freelancers working to short deadlines",
  ],
  features: (s) => [
    "Consistent visual treatment across the set",
    "Predictable file naming",
    "Named layers and groups where the format supports it",
    "Working resolution suitable for real use",
    "Editable source formats",
    "Grouped by type for quick retrieval",
    `Subject coverage focused on ${s}`,
    "Suitable for both screen and print where applicable",
    "No external dependencies required to open",
  ],
  howToUse: () => [
    "Open the files in a compatible editor.",
    "Adjust colour and scale to suit your project.",
    "Export at the size and format your destination requires.",
  ],
  customization: () => [
    "Recolour to match your brand palette",
    "Scale assets without loss where vector formats are supplied",
    "Combine assets to build larger compositions",
  ],
  requirements: ["An editor capable of opening the supplied formats"],
}

/**
 * Resolves an archetype id to its spec, following alias chains
 * (e.g. notion -> planner -> spreadsheet) with a hop limit so a mistake in the
 * alias table can never loop.
 */
export function resolveArchetype(id) {
  let current = id
  for (let hops = 0; hops < 5; hops++) {
    if (ARCHETYPES[current]) return { id, spec: ARCHETYPES[current] }
    const next = ALIASES[current]
    if (!next || next === current) break
    current = next
  }
  return { id, spec: ARCHETYPES.graphic }
}
