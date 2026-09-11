// The DistroSource Originals: 50 web templates, each with its own vertical,
// palette, type pairing, layout and copy. Everything in this file becomes
// real shipped content — page copy inside the template, and listing copy in
// the store — so it is written per product, not generated from a phrase bank.
//
// Kinds: website (multi-page business site), landing (single-product page
// + pricing), dashboard (admin UI), store (storefront + product + cart),
// nextjs (a Next.js 15 App Router project with the same design).

const s = (icon, title, body) => ({ icon, title, body })
const q = (text, role) => ({ text, role })
const f = (q, a) => ({ q, a })
const st = (title, body) => ({ title, body })
import { COPY } from "./copy.mjs"
const plan = (name, price, period, body, items, featured = false) => ({ name, price, period, body, items, featured })
const pr = (name, sub, price, colors, tag, compare) => ({ name, sub, price, colors, tag, compare })

/* ------------------------------------------------------------------ */
/* Websites (16)                                                       */
/* ------------------------------------------------------------------ */

const websites = [
  {
    brand: "Marisol", vertical: "dental clinic", palette: "mint", font: "manrope", radius: "16px", hero: "split",
    tagline: "A calm, confidence-building website for a modern dental practice.",
    site: {
      eyebrow: "Family & cosmetic dentistry", headline: "Dentistry that feels <em>easy</em>.", lede: "Same-week appointments, transparent pricing and a team that explains every step. Marisol gives a dental practice a website that reassures before the first visit.",
      pills: ["Same-week appointments", "Online booking", "All insurances explained"], stats: [["12+", "years in practice"], ["4", "specialist dentists"], ["Sat", "weekend hours"], ["0%", "finance available"]],
      services: [s("shield", "Preventive care", "Six-monthly checks, hygiene visits and sealants that keep small problems small."), s("star", "Cosmetic dentistry", "Whitening, bonding and veneers planned around your face, not a catalogue."), s("tool", "Restorations", "Crowns, bridges and implants with a clear written plan before any work starts."), s("heart", "Children's dentistry", "Gentle first visits and a no-pressure approach that makes the next one easier."), s("clock", "Emergency slots", "Daily same-day emergency appointments for pain, breaks and knocked-out teeth."), s("chat", "Sedation options", "Anxiety-friendly care with sedation options discussed openly at your consultation.")],
      about: { title: "A practice built around the nervous patient", paragraphs: ["Most people who avoid the dentist are not lazy about their health — they had one bad experience. Marisol's layout is designed to answer the questions those patients have before they ever pick up the phone.", "The template leads with people, pricing and process, keeps clinical jargon off the homepage, and makes booking a single tap on mobile."], checks: ["Treatment pages with plain-language explanations", "Price guide page with a downloadable PDF slot", "Team page with individual dentist profiles", "Accessible colour contrast and large tap targets"] },
      steps: [st("Book online or call", "Pick a slot that suits you. New patients get a longer first appointment."), st("Meet the team", "A full check, photos and a plan you can take home and think about."), st("Treatment, at your pace", "Nothing starts until you're comfortable with the plan and the cost.")],
      faq: [f("Do you accept new NHS or insured patients?", "This is placeholder copy — state which insurers and schemes you accept and how patients register."), f("How much does a check-up cost?", "Publish your price guide here or link to the pricing page. Patients trust practices that show numbers."), f("What if I'm nervous?", "Explain sedation options, longer appointments and how patients can signal they want a break."), f("Is parking available?", "Practical details like parking, step-free access and public transport reduce no-shows.")],
      quotes: [q("Booked online at 11pm, seen the next morning. The check-up was thorough and nobody rushed me.", "Patient since 2021"), q("They showed me the photos and explained the options. I felt in control of the decision.", "Implant patient"), q("My daughter actually asks when her next visit is. That never used to happen.", "Parent of two")],
      cta: { title: "Ready for a check-up?", body: "New patient appointments include photos, a hygiene visit and a written plan." },
      contact: { address: "18 Harbour Street, Suite 2, Your City", phone: "+1 (555) 010-2200", email: "hello@marisol-dental.example", hours: "Mon–Fri 8am–6pm · Sat 9am–1pm" },
      gallery: ["Reception", "Surgery 1", "Surgery 2", "Waiting area", "Consult room", "Street view"], pages: ["about", "services", "pricing", "contact"],
      plans: [plan("Hygiene plan", "$24", "/month", "Two hygiene visits a year and 10% off treatment.", ["2 hygiene appointments", "Annual x-rays", "10% off all treatment", "Emergency cover"]), plan("Family plan", "$59", "/month", "Cover for two adults and up to three children.", ["Check-ups for the whole family", "Children's fluoride visits", "15% off treatment", "Priority emergency slots"], true), plan("Pay as you go", "$0", "", "No plan — pay per visit from the price guide.", ["Standard price guide", "Same booking access", "Finance available", "No commitment"])],
      contactTopics: ["New patient appointment", "Emergency", "Cosmetic consultation", "Question about a plan"],
    },
  },
  {
    brand: "Halden", vertical: "architecture studio", palette: "charcoal", font: "editorial", radius: "6px", hero: "editorial",
    tagline: "An editorial, image-led website for an architecture or design studio.",
    site: {
      eyebrow: "Architecture · Interiors · Masterplanning", headline: "Buildings that <em>belong</em> to their place.", lede: "Halden is a studio website that lets the work do the talking: full-bleed project pages, a considered typographic system and a quiet dark palette that makes any photography sing.",
      pills: ["RIBA chartered", "Passivhaus certified designers", "Residential & civic"], stats: [["140", "completed projects"], ["18", "design awards"], ["3", "studios"], ["2009", "founded"]],
      services: [s("home", "Residential", "New builds, extensions and retrofits with a low-energy first approach."), s("globe", "Civic & cultural", "Libraries, galleries and community buildings with long public lives."), s("layers", "Masterplanning", "Neighbourhood-scale strategy that keeps streets walkable and buildings adaptable."), s("leaf", "Sustainability", "Passivhaus, embodied-carbon studies and material passports as standard."), s("tool", "Interiors", "Joinery, lighting and finishes designed as part of the architecture, not after it."), s("file", "Planning & heritage", "Listed-building consent, planning strategy and appeals handled in-house.")],
      about: { title: "Small studio, serious projects", paragraphs: ["Halden gives a practice a website with the restraint of a printed monograph. Project pages carry large images, short captions and credits; the writing is kept to what a client actually wants to know.", "The interior page system suits any studio whose work needs room to breathe: architects, landscape designers, lighting designers and interior practices."], checks: ["Project index with filters by sector and year", "Case-study layout with credits and drawings slots", "Journal page for studio news", "Dark palette tuned for photography"] },
      steps: [st("Briefing", "A site visit and a conversation about how you live or work, before any drawing."), st("Concept & planning", "Options, models and a clear route through planning or consent."), st("Delivery", "Detailed design, tendering and site inspections through to handover.")],
      faq: [f("Do you take on small residential projects?", "State your minimum project size, typical budgets and the regions you cover."), f("How are fees structured?", "Percentage, fixed or staged — explain your model and what each stage includes."), f("Can you help with planning permission?", "Describe your planning and heritage experience and typical timescales."), f("Do you work outside your city?", "List regions or countries and how you handle remote site work.")],
      quotes: [q("They listened more than they talked. The house is exactly what we didn't know how to ask for.", "Private client"), q("Planning approval first time, on a site everyone said was impossible.", "Developer"), q("The library has become the centre of the town. That is the building doing its job.", "Council lead")],
      cta: { title: "Have a site or a building in mind?", body: "Send drawings, photos or just an address. We will tell you honestly what is possible." },
      contact: { address: "Unit 4, Foundry Yard, Your City", phone: "+1 (555) 010-3300", email: "studio@halden.example", hours: "Mon–Fri 9am–6pm" },
      gallery: ["Hillside House", "Civic Library", "Canal Studios", "Orchard Retrofit", "Riverside Masterplan", "Gallery Extension"], pages: ["about", "services", "gallery", "contact"],
    },
  },
  {
    brand: "Corvina", vertical: "restaurant", palette: "sand", font: "serif", radius: "10px", hero: "flip",
    tagline: "A warm, appetite-led website for a restaurant or bistro with menus and reservations.",
    site: {
      eyebrow: "Neighbourhood bistro · Open daily", headline: "Seasonal plates, <em>honest</em> cooking.", lede: "Corvina is a restaurant website that puts the menu, hours and a reservation button where hungry people expect them, and wraps them in warm, editorial styling.",
      pills: ["Reservations online", "Private dining", "Seasonal menu"], stats: [["6", "courses on the tasting menu"], ["48", "seats"], ["2015", "opened"], ["Tue–Sun", "service"]],
      services: [s("cup", "Lunch", "A short, fast weekday menu built around one great dish and a glass of something."), s("star", "Dinner", "Five to six seasonal plates that change every few weeks, plus a tasting menu on Fridays."), s("users", "Private dining", "A twelve-seat room for celebrations, with a set menu and its own sommelier."), s("cal", "Events", "Wine dinners, guest chefs and supper clubs, announced first to the mailing list."), s("leaf", "Produce", "Vegetables from two farms within an hour's drive, named on the menu."), s("heart", "Gift cards", "Digital gift cards for any amount, delivered instantly by email.")],
      about: { title: "A dining room that feels like a kitchen table", paragraphs: ["Corvina's homepage leads with the current menu and a reservations button, because that is what ninety percent of visitors came for. Everything else — story, team, private dining — is a scroll away.", "The menu page is built as accessible HTML rather than an image, so it reads well on phones and screen readers and is easy to update weekly."], checks: ["Menu page with sections and dietary tags", "Reservation form with party size and time", "Private dining page with enquiry form", "Hours and map placed in the footer of every page"] },
      steps: [st("Book a table", "Choose a date, time and party size. Larger groups get a call back."), st("Arrive hungry", "Menus are written that morning. Ask about the off-menu special."), st("Come back for the season", "The menu changes every few weeks. Join the list to hear first.")],
      faq: [f("Do you take walk-ins?", "State your walk-in policy, bar seating and busy times."), f("Can you cater for allergies?", "Explain how dietary requirements are handled and when to tell the kitchen."), f("Is there a dress code?", "Set expectations for the room, or say there is none."), f("How do I book the private room?", "Explain minimum spend, capacity and how far ahead to book.")],
      quotes: [q("The kind of place you want to keep to yourself and tell everyone about at the same time.", "Regular"), q("Our anniversary dinner in the private room was perfect from the first glass to the last plate.", "Private dining guest"), q("The menu genuinely changes. Six visits, six different meals.", "Local food writer")],
      cta: { title: "Tonight's table is waiting", body: "Book online in under a minute, or call for groups of eight or more." },
      contact: { address: "42 Market Lane, Your City", phone: "+1 (555) 010-4400", email: "table@corvina.example", hours: "Tue–Sun 12–3pm · 6–10:30pm" },
      gallery: ["The room", "Open kitchen", "Private dining", "Bar", "Terrace", "Pastry"], pages: ["about", "services", "gallery", "contact"],
      contactTopics: ["Reservation", "Private dining", "Events", "Press"],
    },
  },
  {
    brand: "Ferrow", vertical: "law firm", palette: "slate", font: "lora", radius: "8px", hero: "split",
    tagline: "A trustworthy, plain-English website for a law firm or legal consultancy.",
    site: {
      eyebrow: "Employment · Property · Commercial", headline: "Clear advice when it <em>matters</em>.", lede: "Ferrow gives a law firm a website that explains what you do in the client's language, shows your people, and makes the first conversation easy to start.",
      pills: ["Fixed-fee first consultation", "Response within 24 hours", "Regulated and insured"], stats: [["25", "years combined"], ["3", "practice areas"], ["24h", "response promise"], ["Fixed", "fee options"]],
      services: [s("users", "Employment law", "Contracts, dismissals and settlements for employees and employers."), s("home", "Property", "Conveyancing, leases and disputes with clear timelines and fees."), s("file", "Commercial", "Shareholder agreements, terms of business and company formation."), s("shield", "Dispute resolution", "Mediation first, litigation when it is the right call."), s("heart", "Wills & estates", "Wills, probate and lasting powers of attorney handled with care."), s("card", "Fixed fees", "Published fees for the common matters, quotes for everything else.")],
      about: { title: "Legal advice without the theatre", paragraphs: ["Clients choose a lawyer for confidence and clarity. Ferrow is written and laid out to deliver both: practice areas in plain English, real fees where they can be published, and lawyer profiles that feel like people.", "The template includes a resources page for guides and downloads, which is where many firms win search traffic."], checks: ["Practice-area pages with 'what happens next' sections", "Lawyer profile cards with specialisms", "Fees page with fixed-fee packages", "Enquiry form with matter-type selector"] },
      steps: [st("Tell us the situation", "A short form or a call. We will say straight away whether we can help."), st("Fixed-fee consultation", "An hour with the right lawyer, a written summary and a clear cost estimate."), st("We handle it", "Regular updates in plain English and no surprises on the invoice.")],
      faq: [f("How much will it cost?", "Describe fixed-fee packages, hourly rates and how estimates are given."), f("Do I need to visit the office?", "Explain video consultations and e-signing for documents."), f("How quickly can you start?", "Give realistic turnaround times for urgent matters."), f("Are you regulated?", "State your regulator, insurance and complaints process.")],
      quotes: [q("Everything explained in one page, and the fee was exactly what they quoted.", "Employment client"), q("They kept our house purchase on track when the chain nearly collapsed.", "Property client"), q("Sensible commercial advice, not just legal advice.", "Founder")],
      cta: { title: "Start with a fixed-fee consultation", body: "One hour, one lawyer, a written summary. Book online or call the office." },
      contact: { address: "Chambers House, 9 King Street, Your City", phone: "+1 (555) 010-5500", email: "enquiries@ferrow.example", hours: "Mon–Fri 8:30am–6pm" },
      pages: ["about", "services", "pricing", "contact"],
      plans: [plan("Initial consultation", "$150", "fixed", "One hour with a specialist and a written summary.", ["60-minute consultation", "Written summary", "Cost estimate", "No obligation"]), plan("Will package", "$350", "fixed", "A straightforward will, drafted and witnessed.", ["Single or mirror wills", "Two review rounds", "Secure storage", "Free updates for 12 months"], true), plan("Business starter", "$900", "fixed", "Company formation and core documents.", ["Formation", "Shareholder agreement", "Terms of business", "Privacy policy"])],
      contactTopics: ["Employment matter", "Property transaction", "Commercial advice", "Wills and estates"],
    },
  },
  {
    brand: "Ostberg", vertical: "accounting firm", palette: "ocean", font: "plex", radius: "10px", hero: "center",
    tagline: "A precise, numbers-forward website for an accounting or bookkeeping firm.",
    site: {
      eyebrow: "Accounting · Tax · Payroll", headline: "Numbers you can <em>act on</em>.", lede: "Ostberg is an accountancy website that sells outcomes rather than services: monthly clarity, tax done early, and a team that answers the phone.",
      pills: ["Cloud bookkeeping", "Fixed monthly fees", "Dedicated accountant"],
      appTitle: "Client overview", appCta: "New client", appKpis: [["Clients", "312", "+9%"], ["Filed on time", "99.4%", "+0.3%"], ["Avg. response", "3h", "-1h"]],
      services: [s("chart", "Monthly bookkeeping", "Reconciled books by the 10th of every month, with a one-page summary."), s("file", "Year-end accounts", "Statutory accounts and corporation tax, filed early, no last-minute panic."), s("users", "Payroll", "Payslips, pensions and filings run on time every month."), s("card", "VAT & sales tax", "Registrations, returns and scheme advice that keeps cash in the business."), s("bolt", "Cloud setup", "Migration to cloud accounting with training for your team."), s("shield", "Tax planning", "Quarterly planning calls so the year-end bill is never a surprise.")],
      about: { title: "Accountants who talk like humans", paragraphs: ["The Ostberg homepage explains a monthly service the way a client would describe it to a friend. Pricing is shown as packages, not 'contact us'. The team is visible.", "Interior pages cover services, pricing tiers and a resources section for tax dates and guides."], checks: ["Pricing page with three monthly packages", "Service pages with 'what you get each month'", "Key dates page for tax deadlines", "Client login button slot in the header"] },
      steps: [st("Free review", "We look at your last set of accounts and tell you what we would change."), st("Switch in a week", "We handle the handover with your previous accountant."), st("Monthly rhythm", "Books closed, summary sent, questions answered — every month.")],
      faq: [f("Can you take over mid-year?", "Explain the handover process and what the client needs to provide."), f("Which software do you support?", "List cloud platforms you work with and whether migration is included."), f("What does the monthly fee include?", "Point to the pricing tiers and what falls outside them."), f("Do you work with sole traders?", "Describe the range of client sizes you serve.")],
      quotes: [q("First accountant who explained my numbers instead of just filing them.", "Café owner"), q("Payroll just happens now. I don't think about it.", "Agency director"), q("We planned the tax bill in March instead of panicking in January.", "Consultant")],
      cta: { title: "Get a free review of your accounts", body: "Send your last year-end and we will reply with three concrete suggestions." },
      contact: { address: "Level 3, 27 Dock Road, Your City", phone: "+1 (555) 010-6600", email: "hello@ostberg.example", hours: "Mon–Fri 9am–5:30pm" },
      pages: ["about", "services", "pricing", "contact"],
      plans: [plan("Sole trader", "$95", "/month", "Bookkeeping and tax for one-person businesses.", ["Monthly bookkeeping", "Self-assessment", "Quarterly call", "Email support"]), plan("Limited company", "$240", "/month", "Everything a small company needs, monthly.", ["Bookkeeping & VAT", "Year-end accounts", "Payroll up to 5", "Dedicated accountant"], true), plan("Growing team", "$480", "/month", "For companies with staff, stock or multiple entities.", ["Everything in Limited", "Payroll up to 25", "Management accounts", "Tax planning"])],
      contactTopics: ["Free accounts review", "Switching accountants", "Payroll", "Tax question"],
    },
  },
  {
    brand: "Lindqvist", vertical: "interior design studio", palette: "clay", font: "editorial", radius: "4px", hero: "editorial",
    tagline: "A refined, portfolio-first website for an interior design studio.",
    site: {
      eyebrow: "Residential & hospitality interiors", headline: "Rooms with a <em>point of view</em>.", lede: "Lindqvist is built for studios whose work is the argument. Big images, calm type, and project pages that show the process from mood board to reveal.",
      pills: ["Full-service design", "Furniture sourcing", "Site supervision"], stats: [["90+", "projects"], ["12", "countries"], ["4", "designers"], ["2012", "founded"]],
      services: [s("home", "Residential", "Whole-home design from layout to the last cushion."), s("cup", "Hospitality", "Restaurants, hotels and bars designed for the people who work in them too."), s("layers", "Space planning", "Layouts that make small homes feel generous and large ones feel connected."), s("star", "Furniture & styling", "Sourcing, bespoke pieces and the final styling day."), s("tool", "Renovation management", "Contractors, schedules and site visits handled for you."), s("sun", "Lighting design", "Layered lighting plans that change a room after dark.")],
      about: { title: "Design as a conversation", paragraphs: ["The Lindqvist homepage opens on a single, unhurried statement and one image. It trusts the visitor to scroll. Project pages combine photography with short process notes so prospective clients understand how the studio works.", "The palette is warm clay and stone, chosen to flatter interior photography of any style."], checks: ["Project pages with process notes and credits", "Services page with clear scope per package", "Press and awards section", "Enquiry form with budget range"] },
      steps: [st("Discovery visit", "We walk the space, talk about how you live and set a budget range together."), st("Concept", "Mood boards, layouts and a sample palette, presented in person."), st("Delivery", "Drawings, procurement, site visits and the styling day.")],
      faq: [f("What is a typical budget?", "Give ranges for rooms and whole homes so enquiries are well qualified."), f("Do you work remotely?", "Explain e-design or remote packages if offered."), f("Can you work with our contractor?", "Describe how you collaborate with existing builders."), f("How long does a project take?", "Set expectations for design and delivery timelines.")],
      quotes: [q("They found the version of our house we couldn't see.", "Homeowner"), q("The restaurant photographs beautifully and, more importantly, works on a Friday night.", "Restaurateur"), q("Every decision had a reason. That made the budget conversations easy.", "Client")],
      cta: { title: "Tell us about the space", body: "Send a few photos and the floor plan if you have one. We reply within two working days." },
      contact: { address: "Studio 6, Tannery Row, Your City", phone: "+1 (555) 010-7700", email: "studio@lindqvist.example", hours: "By appointment" },
      gallery: ["Townhouse", "Lakeside cabin", "Boutique hotel", "Wine bar", "Loft apartment", "Family kitchen"], pages: ["about", "services", "gallery", "contact"],
      contactTopics: ["Residential project", "Hospitality project", "Press", "Collaboration"],
    },
  },
  {
    brand: "Tamsin", vertical: "yoga & pilates studio", palette: "sage", font: "sora", radius: "20px", hero: "split",
    tagline: "A soft, welcoming website for a yoga, pilates or wellness studio with class schedules.",
    site: {
      eyebrow: "Yoga · Pilates · Breathwork", headline: "Move, breathe, <em>begin again</em>.", lede: "Tamsin gives a studio a website that gets people to their first class: a clear schedule, honest pricing, and copy that welcomes beginners instead of intimidating them.",
      pills: ["Beginner friendly", "Book from your phone", "First class free"], stats: [["38", "classes a week"], ["9", "teachers"], ["2", "studios"], ["Free", "first class"]],
      services: [s("sun", "Vinyasa flow", "Breath-led movement that builds heat and focus. All levels."), s("heart", "Restorative", "Slow, supported shapes for nervous systems that need a rest."), s("bolt", "Reformer pilates", "Small-group reformer classes with hands-on cueing."), s("users", "Beginners course", "Six weeks from the ground up. No experience, no problem."), s("leaf", "Breathwork", "Guided sessions for sleep, stress and recovery."), s("cal", "Workshops", "Weekend deep-dives with visiting teachers.")],
      about: { title: "A studio for real bodies", paragraphs: ["Most studio websites are photographs of impossible poses. Tamsin is written for the person who has never been, and the design follows: soft colours, generous spacing and a schedule you can read on a phone in a car park.", "Class pages explain what to bring, what to wear and what a first class actually feels like."], checks: ["Weekly schedule page with filters by style", "Class pages with 'first time?' notes", "Pricing page with intro offer, memberships and class packs", "Teacher profiles with training and specialisms"] },
      steps: [st("Claim your free class", "Pick any beginner-friendly class from the schedule."), st("Arrive ten minutes early", "We will show you the space, the props and where the tea is."), st("Find your rhythm", "Try a few styles, then pick a pack or membership that fits.")],
      faq: [f("I'm not flexible. Can I still come?", "Reassure beginners and point to the beginners course."), f("What should I bring?", "List what the studio provides and what to wear."), f("Can I pause my membership?", "Explain pause and cancellation rules honestly."), f("Do you offer private sessions?", "Describe one-to-one and small-group options.")],
      quotes: [q("I came for my back and stayed for the people.", "Member, 2 years"), q("The beginners course was the first time yoga made sense to me.", "Course graduate"), q("Reformer classes are small enough that you actually get corrected.", "Pilates member")],
      cta: { title: "Your first class is on us", body: "Book any class marked beginner-friendly and arrive ten minutes early." },
      contact: { address: "The Old Chapel, 3 Mill Street, Your City", phone: "+1 (555) 010-8800", email: "hello@tamsin.example", hours: "Daily 6:30am–9pm" },
      pages: ["about", "services", "pricing", "contact"],
      plans: [plan("Intro month", "$49", "first month", "Unlimited classes for 30 days, for new students.", ["Unlimited mat classes", "One reformer class", "Beginners course access", "No commitment"]), plan("Unlimited", "$129", "/month", "Every class, every week.", ["Unlimited mat & reformer", "Workshop discounts", "Pause anytime", "Guest passes"], true), plan("10-class pack", "$170", "valid 3 months", "Flexible for busy schedules.", ["10 classes", "Any style", "Shareable with a friend", "3-month validity"])],
      contactTopics: ["First class", "Membership", "Private sessions", "Teacher training"],
    },
  },
  {
    brand: "Brightwater", vertical: "plumbing & heating company", palette: "cobalt", font: "archivo", radius: "12px", hero: "split",
    tagline: "A fast, phone-first website for a plumbing, heating or home-services company.",
    site: {
      eyebrow: "Plumbing · Heating · Emergencies", headline: "Fixed today, <em>done properly</em>.", lede: "Brightwater is a trades website built for the way people actually find a plumber: on a phone, in a hurry. Big call button, clear service list, real prices, proof of qualifications.",
      pills: ["24/7 emergency call-out", "Fixed prices quoted upfront", "Fully certified engineers"], stats: [["45min", "average emergency response"], ["12", "vans on the road"], ["Gas", "safe registered"], ["5yr", "boiler guarantee"]],
      services: [s("bolt", "Emergency call-out", "Leaks, no heating, no hot water — a real person answers, day or night."), s("tool", "Boiler installation", "Fixed-price installs with a written quote and a five-year guarantee."), s("wrench", "Repairs & servicing", "Annual services and same-week repairs on all major brands."), s("home", "Bathrooms", "Full bathroom fitting from first-fix to tiling."), s("sun", "Heat pumps", "Air-source heat pump surveys, grants and installation."), s("shield", "Landlord certificates", "Gas safety and compliance certificates, reminders included.")],
      about: { title: "Straight answers, tidy work", paragraphs: ["Brightwater's homepage answers the three things a customer wants to know: can you come today, what will it cost, and are you qualified. Everything on the page pushes toward the call button.", "Service pages include price-from figures and 'what happens on the day' sections that reduce phone-time for the office."], checks: ["Sticky call button on mobile", "Service pages with price-from tables", "Certifications and guarantees section", "Service-area page with a map placeholder"] },
      steps: [st("Call or book online", "Tell us what is wrong. Emergencies are prioritised."), st("Fixed quote", "The engineer diagnoses and quotes before starting work."), st("Fixed and tidied", "Work done, area cleaned, guarantee in your inbox.")],
      faq: [f("Do you charge a call-out fee?", "Be explicit about call-out fees, evenings and weekends."), f("Which areas do you cover?", "List postcodes or towns and typical response times."), f("Are your engineers certified?", "State registrations and how customers can verify them."), f("Can I pay in instalments?", "Explain finance options for larger jobs.")],
      quotes: [q("Boiler died on a Sunday night. Engineer here by eight, fixed by nine.", "Homeowner"), q("Quoted a price, charged that price. Rare.", "Landlord"), q("Our whole bathroom done in a week, and they hoovered.", "Homeowner")],
      cta: { title: "No heating? No hot water?", body: "Call now for a same-day engineer, or book a service online in under a minute." },
      contact: { address: "Unit 12, Riverside Trading Estate, Your City", phone: "+1 (555) 010-9900", email: "jobs@brightwater.example", hours: "24/7 emergencies · Office Mon–Fri 8am–6pm" },
      pages: ["about", "services", "pricing", "contact"],
      plans: [plan("Boiler service", "$95", "fixed", "Annual service with a full safety check.", ["Full service", "Safety certificate", "Reminder next year", "Priority booking"]), plan("Care plan", "$18", "/month", "Cover for breakdowns and an annual service.", ["Unlimited call-outs", "Parts & labour", "Annual service", "No excess"], true), plan("New boiler", "From $2,400", "installed", "Fixed-price installation with a 5-year guarantee.", ["Survey & quote", "Installation in a day", "5-year guarantee", "Old boiler removed"])],
      contactTopics: ["Emergency", "Boiler quote", "Service booking", "Landlord certificate"],
    },
  },
  {
    brand: "Kestwood", vertical: "veterinary clinic", palette: "lime", font: "jakarta", radius: "18px", hero: "flip",
    tagline: "A friendly, reassuring website for a veterinary practice or animal hospital.",
    site: {
      eyebrow: "Small animal veterinary care", headline: "Care for the <em>whole family</em>, paws included.", lede: "Kestwood helps a vet practice look as kind and competent as it is: services explained for worried owners, emergency details impossible to miss, and online booking front and centre.",
      pills: ["Same-day appointments", "24h emergency line", "Health plans from $12/mo"], stats: [["6", "vets"], ["24h", "emergency cover"], ["3,200", "registered pets"], ["In-house", "lab & x-ray"]],
      services: [s("heart", "Wellness & vaccinations", "Annual checks, vaccines and parasite control on a plan you don't have to remember."), s("tool", "Surgery", "Neutering, soft-tissue and orthopaedic surgery with modern anaesthesia monitoring."), s("bolt", "Emergency care", "24-hour emergency line with a vet on call every night."), s("search", "Diagnostics", "In-house blood tests, x-ray and ultrasound for same-visit answers."), s("star", "Dental", "Scale, polish and extractions under anaesthetic, with before-and-after photos."), s("leaf", "Senior pets", "Mobility, pain and weight clinics for older animals.")],
      about: { title: "For the owner in the waiting room", paragraphs: ["Kestwood's design starts from the anxious owner at 2am. Emergency contact details are pinned to the header; pricing is plain; the tone is calm.", "Service pages explain what happens during a visit and how long it takes, and the health-plan page turns a scary annual bill into a small monthly one."], checks: ["Emergency banner slot in the header", "Health plan page with monthly pricing", "Register-a-pet form", "Team page for vets and nurses"] },
      steps: [st("Register your pet", "A two-minute form. We will fetch previous records for you."), st("First visit", "A full check, a chat about diet and prevention, and a plan."), st("Ongoing care", "Reminders for boosters and checks, and a number that always answers.")],
      faq: [f("What counts as an emergency?", "Give owners a clear list and the number to call."), f("Do you offer payment plans?", "Explain health plans, insurance and instalments."), f("Can I get repeat prescriptions online?", "Describe the repeat-medication process."), f("Do you see exotic pets?", "Be clear about species you treat.")],
      quotes: [q("Rang at midnight, a real vet answered, our dog was seen within the hour.", "Dog owner"), q("The health plan means the annual visit no longer hurts the budget.", "Cat owner"), q("They explained the x-ray to us properly. We felt part of the decision.", "Rabbit owner")],
      cta: { title: "New to the area? Register your pet today", body: "Two minutes online, and your first wellness check is half price." },
      contact: { address: "Kestwood Veterinary Centre, 5 Park Road, Your City", phone: "+1 (555) 011-0100", email: "care@kestwood.example", hours: "Mon–Sat 8am–7pm · Emergency 24h" },
      pages: ["about", "services", "pricing", "contact"],
      plans: [plan("Kitten & puppy plan", "$12", "/month", "First-year vaccines, checks and neutering discount.", ["Vaccination course", "Monthly parasite control", "Two health checks", "20% off neutering"]), plan("Adult plan", "$16", "/month", "Everything preventive, all year.", ["Annual booster", "Parasite control", "Two health checks", "10% off services"], true), plan("Senior plan", "$22", "/month", "Extra checks and bloods for older pets.", ["Everything in Adult", "Twice-yearly bloods", "Mobility clinic", "15% off dental"])],
      contactTopics: ["Register a pet", "Emergency", "Health plan", "Repeat prescription"],
    },
  },
  {
    brand: "Alderyn", vertical: "wedding photographer", palette: "rose", font: "editorial", radius: "2px", hero: "editorial",
    tagline: "An elegant, image-first website for a wedding or portrait photographer.",
    site: {
      eyebrow: "Documentary wedding photography", headline: "The day as it <em>actually</em> felt.", lede: "Alderyn is a photographer's website that gets out of the way: full galleries, a simple pricing page, and an enquiry form that asks the right questions.",
      pills: ["Unposed, documentary style", "Worldwide travel", "Two photographers on the day"], stats: [["210", "weddings"], ["14", "countries"], ["2", "photographers"], ["8wk", "gallery delivery"]],
      services: [s("camera", "Full-day coverage", "From getting ready to the last dance, with two of us on the day."), s("heart", "Elopements", "Small, intentional days anywhere in the world."), s("users", "Engagement sessions", "An hour together before the wedding so the camera feels familiar."), s("file", "Albums", "Hand-bound albums designed with you after the gallery."), s("play", "Film", "Short films alongside the photographs, by a partner filmmaker."), s("globe", "Destination", "Travel included in quotes for anywhere we can reach.")],
      about: { title: "Photographs you'll still love in thirty years", paragraphs: ["Alderyn's layout is quiet on purpose: soft rose and paper tones, editorial serif headings, and galleries that let the images carry the emotion.", "The pricing page uses three clear packages, which converts better than 'enquire for pricing' and saves hours of email."], checks: ["Gallery pages with masonry and full-bleed rows", "Pricing page with three packages", "Enquiry form with date and venue fields", "Journal page for recent weddings"] },
      steps: [st("Say hello", "Tell us the date and the venue. If we're free, we'll set up a call."), st("Plan the day", "A timeline chat a month before, so we know the moments that matter to you."), st("Relive it", "A sneak peek within days, the full gallery within eight weeks.")],
      faq: [f("How far in advance should we book?", "Give typical lead times and peak season notes."), f("Do you travel?", "Explain travel policy and how it is priced."), f("How many photos do we get?", "Set expectations for gallery size and editing."), f("Can family members take photos too?", "Describe your approach to guest photography.")],
      quotes: [q("We forgot they were there. Then the photos arrived and we cried.", "Couple, 2024"), q("Our elopement was just us and them. Perfect.", "Elopement couple"), q("The album is the first thing we show anyone who visits.", "Couple, 2023")],
      cta: { title: "Check your date", body: "Send the date and the venue. We reply within 48 hours, usually faster." },
      contact: { address: "Based in Your City · available worldwide", phone: "+1 (555) 011-0200", email: "hello@alderyn.example", hours: "Replies within 48 hours" },
      gallery: ["Getting ready", "Ceremony", "Portraits", "Reception", "Details", "Last dance"], pages: ["about", "gallery", "pricing", "contact"],
      plans: [plan("Elopement", "$1,800", "up to 4 hours", "Small days, anywhere.", ["4 hours coverage", "One photographer", "Online gallery", "Print release"]), plan("Full day", "$3,900", "up to 10 hours", "The whole story, two photographers.", ["10 hours", "Two photographers", "Engagement session", "Online gallery & prints"], true), plan("Full day + album", "$4,800", "up to 12 hours", "Everything, plus a hand-bound album.", ["12 hours", "Two photographers", "40-page album", "Parent albums available"])],
      contactTopics: ["Wedding enquiry", "Elopement", "Engagement session", "Album order"],
    },
  },
  {
    brand: "Solvay", vertical: "coworking space", palette: "ink", font: "grotesk", radius: "14px", hero: "center",
    tagline: "A sharp, membership-driven website for a coworking space or flexible office.",
    site: {
      eyebrow: "Coworking · Private offices · Events", headline: "Work from a place that <em>works</em>.", lede: "Solvay is a coworking website that sells memberships: tour booking above the fold, plans that are easy to compare, and pages for the meeting rooms and events that make a space a community.",
      pills: ["24/7 access", "Meeting rooms included", "Month to month"],
      appTitle: "Space occupancy", appCta: "Book a tour", appKpis: [["Members", "218", "+14%"], ["Desks free", "23", "today"], ["Rooms booked", "31", "this week"]],
      services: [s("home", "Hot desks", "Any desk, any day, with lockers and unlimited coffee."), s("users", "Dedicated desks", "Your own desk, monitor and drawer in a quieter zone."), s("lock", "Private offices", "Glass-walled offices for two to twelve, furnished and ready."), s("cal", "Meeting rooms", "Six rooms from four to twenty seats, bookable by the hour."), s("play", "Events", "Talks, breakfasts and member socials every week."), s("globe", "Virtual office", "A business address and mail handling from $29 a month.")],
      about: { title: "Designed for people who take work seriously", paragraphs: ["Solvay's dark, confident palette signals a space for professionals. The homepage shows the plans, the rooms and the community without a single stock photo.", "The membership page uses a comparison layout with a highlighted plan, and the tour form asks only for the essentials."], checks: ["Membership comparison with a featured plan", "Meeting room page with capacities", "Events page layout", "Tour booking form with preferred time"] },
      steps: [st("Book a tour", "Fifteen minutes, a coffee, and every room open."), st("Pick a plan", "Month to month. Upgrade or downgrade any time."), st("Move in Monday", "Keycard, Wi-Fi and a desk — the same day you sign.")],
      faq: [f("Is there a minimum term?", "State commitment terms clearly."), f("Can I bring guests?", "Explain guest policy and day passes."), f("Are meeting rooms included?", "Describe credits and hourly rates."), f("Is parking available?", "List parking, bike storage and transport.")],
      quotes: [q("The quiet zone is the reason I renewed. Actual focus.", "Member, dedicated desk"), q("We scaled from two hot desks to a six-person office without moving buildings.", "Startup founder"), q("Friday breakfasts are where I've met half my clients.", "Freelance designer")],
      cta: { title: "See the space this week", body: "Tours run every weekday. Book a slot and come as you are." },
      contact: { address: "Solvay Works, 100 Union Street, Your City", phone: "+1 (555) 011-0300", email: "hello@solvay.example", hours: "Reception Mon–Fri 8am–7pm · Members 24/7" },
      pages: ["about", "services", "pricing", "contact"],
      plans: [plan("Hot desk", "$190", "/month", "Any open desk, 24/7 access.", ["24/7 access", "Locker", "4 room credits", "Coffee & events"]), plan("Dedicated desk", "$340", "/month", "Your own desk in the quiet zone.", ["Everything in Hot desk", "Monitor & storage", "10 room credits", "Mail handling"], true), plan("Private office", "From $1,200", "/month", "Furnished offices for 2–12.", ["Lockable office", "Branding on door", "30 room credits", "Dedicated line"])],
      contactTopics: ["Book a tour", "Private office", "Meeting rooms", "Events & partnerships"],
    },
  },
  {
    brand: "Moravia", vertical: "boutique hotel", palette: "sand", font: "editorial", radius: "8px", hero: "flip",
    tagline: "A serene, booking-focused website for a boutique hotel, inn or guesthouse.",
    site: {
      eyebrow: "A twelve-room hotel by the water", headline: "Stay somewhere <em>quiet</em>.", lede: "Moravia is a hotel website designed around the booking widget: room types with real detail, a restaurant page, and the local-area content guests search for before they book.",
      pills: ["Direct booking rate", "Breakfast included", "Dogs welcome"], stats: [["12", "rooms"], ["1 min", "to the water"], ["4.8", "kitchen open"], ["Free", "cancellation to 48h"]],
      services: [s("home", "Rooms & suites", "Twelve rooms, each different, each with a view worth waking up for."), s("cup", "Restaurant", "Breakfast for guests, dinner for everyone, from a short seasonal menu."), s("sun", "The garden & terrace", "Evening drinks on the terrace and a walled garden for quiet afternoons."), s("leaf", "Wellness", "A small sauna, massage by appointment and morning yoga in summer."), s("users", "Private hire", "Take the whole house for a wedding or a gathering of up to thirty."), s("pin", "Explore", "Walks, boats and villages within an hour, with our maps.")],
      about: { title: "A house, not a hotel", paragraphs: ["Moravia leads with atmosphere: warm sand tones, a serif that feels printed, and photography placed like a magazine spread. Rooms are described honestly — size, view, bed — which reduces awkward arrival conversations.", "Every page carries the booking bar, and the direct-rate promise is stated plainly to pull bookings away from agencies."], checks: ["Room pages with amenities lists and gallery slots", "Booking bar on every page", "Restaurant page with sample menu", "Local area guide page"] },
      steps: [st("Choose your room", "Each room page shows size, view and bed so there are no surprises."), st("Book direct", "The best rate is always here, with free cancellation to 48 hours."), st("Arrive and exhale", "Check-in with a drink, dinner if you like, and nothing you have to do.")],
      faq: [f("Is breakfast included?", "State what's included in the rate."), f("Are children and dogs welcome?", "Explain family and pet policies."), f("How do I get there without a car?", "Give transport details and transfers."), f("Can we hire the whole hotel?", "Describe exclusive-use options and capacity.")],
      quotes: [q("We stayed two nights and wished it were five.", "Guest, autumn"), q("Dinner was the best we had on the whole trip.", "Guest, summer"), q("Our wedding weekend took over the whole house. Effortless.", "Wedding couple")],
      cta: { title: "Check availability", body: "Best rate guaranteed when you book direct, with breakfast and free cancellation to 48 hours." },
      contact: { address: "Moravia House, Harbour Lane, Your Town", phone: "+1 (555) 011-0400", email: "stay@moravia.example", hours: "Reception 7am–10pm" },
      gallery: ["The Corner Room", "Suite 3", "Restaurant", "Terrace", "Garden", "Harbour view"], pages: ["about", "services", "gallery", "contact"],
      contactTopics: ["Booking enquiry", "Restaurant reservation", "Private hire", "Press"],
    },
  },
  {
    brand: "Pelican Bay", vertical: "surf & paddleboard school", palette: "ocean", font: "outfit", radius: "22px", hero: "split",
    tagline: "A bright, energetic website for a surf school, water-sports centre or outdoor activity business.",
    site: {
      eyebrow: "Surf · SUP · Coasteering", headline: "Get in the <em>water</em>.", lede: "Pelican Bay is a bookings-first activity website: lessons and hire with clear prices, a live-conditions slot, and a booking flow that works on a wet phone on the beach.",
      pills: ["All kit included", "Ages 8+", "Small groups of 6"], stats: [["8", "instructors"], ["6", "max per group"], ["Apr–Oct", "season"], ["All", "kit included"]],
      services: [s("sun", "Beginner surf lessons", "Two hours, a wetsuit, a board and a guaranteed stand-up moment."), s("bolt", "Improver coaching", "Video feedback and small groups for surfers chasing their first green wave."), s("leaf", "Paddleboarding", "Calm-water SUP tours along the estuary at sunrise and sunset."), s("users", "Kids' club", "Weekly summer sessions for eight to fourteen year olds."), s("globe", "Coasteering", "Scrambles, jumps and swims along the headland with a guide."), s("box", "Hire", "Boards, wetsuits and SUPs by the hour, half day or day.")],
      about: { title: "Built for the beach, not the boardroom", paragraphs: ["Pelican Bay uses big type, bright ocean tones and buttons you can hit with a wet thumb. Session pages show duration, ability level and price up top, then what to bring and what happens on the day.", "A conditions block on the homepage is a placeholder for a live surf report embed."], checks: ["Session pages with level, duration and price", "Conditions block for a surf report embed", "Group and school booking enquiry form", "Gift voucher page"] },
      steps: [st("Pick a session", "Beginner, improver or a tour. Kit is always included."), st("Book and show up", "Meet at the hut fifteen minutes before. We check the tide for you."), st("Come back stronger", "Coaches remember your last session and pick up where you left off.")],
      faq: [f("Do I need to be able to swim?", "State the swimming requirement plainly."), f("What if the weather is bad?", "Explain rescheduling and refunds for cancelled sessions."), f("Is a wetsuit included?", "List everything included in the price."), f("Can we book a private group?", "Describe group sizes and private options.")],
      quotes: [q("Stood up on my first lesson. Hooked.", "Beginner"), q("Sunrise paddle was the highlight of our holiday.", "SUP tour guest"), q("The kids' club is the only thing my two agree on.", "Parent")],
      cta: { title: "Tide's right. Book a session", body: "Beginner lessons daily in season. Groups of six, kit included, all ages from eight." },
      contact: { address: "The Surf Hut, Pelican Bay Beach", phone: "+1 (555) 011-0500", email: "hello@pelicanbay.example", hours: "Daily 8am–7pm (season)" },
      pages: ["about", "services", "pricing", "contact"],
      plans: [plan("Taster", "$45", "2 hours", "One beginner lesson, all kit included.", ["2-hour lesson", "Wetsuit & board", "Group of 6", "Photos included"]), plan("Weekend course", "$160", "2 days", "Four sessions across two days.", ["4 sessions", "Video feedback", "Free hire between sessions", "Certificate"], true), plan("Season pass", "$390", "Apr–Oct", "Unlimited improver sessions all season.", ["Unlimited coached sessions", "20% off hire", "Priority booking", "Club events"])],
      contactTopics: ["Book a lesson", "Group booking", "Schools & youth groups", "Gift vouchers"],
    },
  },
  {
    brand: "Redfern", vertical: "craft brewery & taproom", palette: "charcoal", font: "archivo", radius: "6px", hero: "editorial",
    tagline: "A bold, character-rich website for a craft brewery, distillery or taproom.",
    site: {
      eyebrow: "Brewery · Taproom · Tours", headline: "Beer with <em>somewhere to be</em>.", lede: "Redfern is a brewery website with the swagger of a good label: heavy type, a dark palette, a beer list that reads like a menu, and taproom hours nobody can miss.",
      pills: ["Taproom open Thu–Sun", "Brewery tours Saturdays", "Ships nationwide"], stats: [["14", "beers on tap"], ["2016", "first brew"], ["Sat", "tours"], ["48h", "shipping"]],
      services: [s("cup", "The taproom", "Fourteen taps, a rotating kitchen residency and a dog on most stools."), s("play", "Brewery tours", "Ninety minutes, four tasters and the story of how it started in a garage."), s("box", "Online shop", "Mixed cases, merch and gift boxes shipped within 48 hours."), s("users", "Private events", "The mezzanine for forty, with a private bar and a tour thrown in."), s("cal", "Events", "Quiz nights, tap takeovers and the annual harvest festival."), s("truck", "Wholesale", "Kegs and cases for bars and shops, with a portal for reorders.")],
      about: { title: "Started in a garage. Still tastes like it means it.", paragraphs: ["Redfern's design borrows from packaging: condensed type, high contrast and colour used sparingly like a label accent. The beer page lists ABV, style and tasting notes in a clean table that doubles as a taproom board.", "Tours and events are bookable from their own pages, and the shop page is a ready layout for connecting to your commerce platform."], checks: ["Beer list with style, ABV and notes", "Tour booking page", "Events calendar layout", "Shop grid ready for a commerce platform"] },
      steps: [st("Find us", "The taproom is at the brewery. Follow the smell of malt."), st("Try a flight", "Four thirds of anything on the board, picked by you or by us."), st("Take some home", "Cans from the fridge, or a mixed case shipped to your door.")],
      faq: [f("Do you serve food?", "Describe the kitchen residency or food policy."), f("Can I bring children and dogs?", "State policies for families and pets."), f("How do I book a tour?", "Explain times, group sizes and gift options."), f("Do you ship beer?", "List shipping areas, costs and age verification.")],
      quotes: [q("The tour ends in the taproom, which is exactly right.", "Tour guest"), q("Our office party took the mezzanine. Nobody wanted to leave.", "Event booker"), q("The pale ale is the reason I moved to this side of town.", "Regular")],
      cta: { title: "Taproom's open Thursday to Sunday", body: "Fourteen taps, a kitchen residency and tours every Saturday. No booking needed for the bar." },
      contact: { address: "Redfern Brewing Co., 7 Ironworks Road, Your City", phone: "+1 (555) 011-0600", email: "cheers@redfern.example", hours: "Thu–Fri 4–11pm · Sat 12–11pm · Sun 12–8pm" },
      gallery: ["Taproom", "Brewhouse", "Canning line", "Mezzanine", "Beer garden", "Cold store"], pages: ["about", "services", "gallery", "contact"],
      contactTopics: ["Tour booking", "Private event", "Wholesale", "Press"],
    },
  },
  {
    brand: "Whitlow", vertical: "physiotherapy clinic", palette: "mint", font: "plex", radius: "12px", hero: "split",
    tagline: "A clean, clinical-but-kind website for a physiotherapy, chiropractic or sports-injury clinic.",
    site: {
      eyebrow: "Physiotherapy · Sports injury · Rehab", headline: "Get back to what you <em>love doing</em>.", lede: "Whitlow gives a clinic a website that turns pain into an appointment: conditions explained simply, therapists with real credentials, and online booking on every page.",
      pills: ["No referral needed", "Evening appointments", "Insurance accepted"], stats: [["7", "physios"], ["45min", "first appointment"], ["Same", "week booking"], ["Gym", "on site"]],
      services: [s("bolt", "Sports injuries", "Assessment, treatment and a return-to-sport plan with measurable milestones."), s("heart", "Back & neck pain", "Hands-on treatment and exercise programmes for the most common problems we see."), s("tool", "Post-surgery rehab", "Structured recovery after joint replacements and ligament repairs."), s("users", "Women's health", "Pelvic health, pregnancy and postnatal physiotherapy."), s("clock", "Acupuncture", "Used alongside physiotherapy for pain and tension."), s("chart", "Strength & conditioning", "Supervised gym sessions to keep the problem from coming back.")],
      about: { title: "Treatment with a plan, not just a session", paragraphs: ["Whitlow's homepage speaks to the person Googling their symptom at midnight: what we treat, who will treat it, and how soon. Condition pages describe what the first appointment involves.", "The mint-and-charcoal palette is clinical without being cold, and the type is large enough for a patient reading on a phone in pain."], checks: ["Condition pages with 'your first appointment' sections", "Therapist profiles with registrations", "Pricing page with initial and follow-up fees", "Online booking button in the header on every page"] },
      steps: [st("Book an assessment", "Forty-five minutes with a physio, no referral needed."), st("Get a plan", "Diagnosis, hands-on treatment and a home programme on day one."), st("Recover, and stay recovered", "Follow-ups as needed and a strength plan to prevent a repeat.")],
      faq: [f("Do I need a doctor's referral?", "State referral requirements for self-pay and insured patients."), f("What should I wear?", "Practical guidance on clothing for assessments."), f("How many sessions will I need?", "Give honest ranges and explain the plan approach."), f("Do you accept my insurance?", "List insurers and the claims process.")],
      quotes: [q("Two sessions and a plan I actually followed. Marathon done.", "Runner"), q("They explained the scan in words I understood.", "Post-surgery patient"), q("Evening appointments meant I didn't have to take time off.", "Office worker")],
      cta: { title: "In pain? Book an assessment this week", body: "Forty-five minutes with a physiotherapist, a diagnosis and a plan. No referral needed." },
      contact: { address: "Whitlow Clinic, 21 Station Approach, Your City", phone: "+1 (555) 011-0700", email: "book@whitlow.example", hours: "Mon–Fri 7am–8pm · Sat 8am–1pm" },
      pages: ["about", "services", "pricing", "contact"],
      plans: [plan("Initial assessment", "$85", "45 min", "Diagnosis, treatment and a home plan.", ["45-minute appointment", "Written plan", "Exercise app access", "Insurance receipt"]), plan("Follow-up", "$65", "30 min", "Treatment and plan progression.", ["30-minute session", "Plan updates", "Same-week booking", "Direct messaging"], true), plan("Rehab block", "$330", "6 sessions", "Six follow-ups at a reduced rate.", ["6 sessions", "Gym access", "Strength programme", "Valid 3 months"])],
      contactTopics: ["Book an assessment", "Insurance question", "Post-surgery rehab", "Something else"],
    },
  },
  {
    brand: "Casterly", vertical: "real estate agency", palette: "slate", font: "jakarta", radius: "10px", hero: "center",
    tagline: "A polished, listings-ready website for a real estate agency or property consultancy.",
    site: {
      eyebrow: "Sales · Lettings · Valuations", headline: "Property, handled <em>properly</em>.", lede: "Casterly is an estate-agency website with a listings grid, a free-valuation funnel and area guides — the three pages that generate almost every enquiry an agency gets.",
      pills: ["Free valuation in 24h", "No sale, no fee", "Local since 2004"],
      appTitle: "Featured listings", appCta: "Book valuation", appKpis: [["Active listings", "86", "+6"], ["Avg. days to offer", "19", "-4"], ["Asking price achieved", "98.7%", "+0.5%"]],
      services: [s("home", "Selling", "Photography, floor plans and a launch plan across every major portal."), s("card", "Buying", "Off-market previews and honest guidance on price."), s("users", "Lettings", "Tenant finding, referencing and full management for landlords."), s("chart", "Valuations", "A free, evidence-based valuation within 24 hours."), s("file", "Mortgages", "Independent advice through our partner brokers."), s("pin", "Area guides", "Schools, transport and prices for every neighbourhood we cover.")],
      about: { title: "An agency that shows its numbers", paragraphs: ["Casterly's homepage is built around two actions: browse listings and book a valuation. The listing card layout is ready to connect to a property feed, and the valuation form asks only for an address and a phone number.", "Area guides are included as a content pattern because they rank, and because buyers read them."], checks: ["Listings grid and single-property layout", "Valuation form funnel", "Area guide page pattern", "Team page with negotiators"] },
      steps: [st("Book a free valuation", "We visit, measure and give you a number with the evidence behind it."), st("Launch properly", "Professional photos, a floor plan and every portal on day one."), st("Sold, with support", "We chase the chain and keep you informed until completion.")],
      faq: [f("What are your fees?", "Publish fee structures for sales and lettings."), f("How long does it take to sell?", "Share your average and what affects it."), f("Do you manage rentals?", "Describe management tiers for landlords."), f("Which areas do you cover?", "List neighbourhoods and link to area guides.")],
      quotes: [q("Offer in eleven days, above asking.", "Seller"), q("They found us a house before it went online.", "Buyer"), q("Full management means I never hear about the boiler.", "Landlord")],
      cta: { title: "What's your home worth?", body: "A free, evidence-based valuation within 24 hours. No obligation, no pressure." },
      contact: { address: "Casterly & Co., 55 High Street, Your City", phone: "+1 (555) 011-0800", email: "sales@casterly.example", hours: "Mon–Sat 9am–6pm" },
      gallery: ["Garden flat", "Victorian terrace", "New-build apartment", "Farmhouse", "Penthouse", "Family semi"], pages: ["about", "services", "gallery", "contact"],
      contactTopics: ["Free valuation", "Buying", "Lettings", "Mortgage advice"],
    },
  },
]

/* ------------------------------------------------------------------ */
/* Landing pages (10)                                                  */
/* ------------------------------------------------------------------ */

const landings = [
  {
    brand: "Loopwise", vertical: "habit-tracking app", palette: "plum", font: "sora", radius: "18px",
    tagline: "A crisp SaaS landing page for a habit, routine or wellbeing app.",
    site: {
      eyebrow: "Habits that survive Mondays", headline: "Build routines that <em>stick</em>.", lede: "Loopwise is a landing page for a consumer app: a product screenshot above the fold, benefits told as outcomes, a three-tier pricing table and a FAQ that handles objections before support does.",
      pills: ["Free forever plan", "iOS, Android & web", "No ads, ever"], appTitle: "This week", appCta: "Add habit", appKpis: [["Streak", "23 days", "+1"], ["Completed", "86%", "+4%"], ["Habits", "7", "active"]],
      benefits: [s("bolt", "One-tap check-ins", "Log a habit from your lock screen in under a second."), s("chart", "Honest streaks", "Streaks that allow a rest day, so one slip doesn't reset your progress."), s("bell", "Smart reminders", "Nudges that learn when you actually do things, not when you said you would."), s("users", "Accountability circles", "Share a habit with up to five friends and see each other's check-ins."), s("layers", "Routines", "Stack habits into morning and evening routines with one timer."), s("lock", "Private by design", "Your data stays on your device unless you choose to sync.")],
      how: [st("Pick three habits", "Start small. Loopwise suggests a starter set based on your goal."), st("Check in daily", "A tap on the widget or a word to your assistant."), st("Watch the loop close", "Weekly reviews show what worked and what to drop.")],
      plans: [plan("Free", "$0", "/month", "Everything you need to start.", ["3 habits", "Daily reminders", "Weekly review", "All platforms"]), plan("Plus", "$4", "/month", "For people who take routines seriously.", ["Unlimited habits", "Routines & timers", "Accountability circles", "Export"], true), plan("Family", "$9", "/month", "Up to six people, one bill.", ["Everything in Plus", "6 accounts", "Shared habits", "Parental controls"])],
      faq: [f("Is there really a free plan?", "Yes — three habits, reminders and reviews, with no time limit."), f("Does it sync between devices?", "Sync is optional and end-to-end encrypted on Plus."), f("What happens if I miss a day?", "Rest days are built in. Streaks bend, they don't break."), f("Can I export my data?", "CSV and JSON export on any paid plan.")],
      quotes: [q("Six months of morning pages. That has never happened before.", "Writer"), q("The rest-day rule is the whole reason it works.", "Runner"), q("My kids and I share a reading habit. Small thing, big change.", "Parent")],
      cta: { title: "Start your first loop tonight", body: "Free on every platform. No card, no ads, no guilt." },
    },
  },
  {
    brand: "Signalbay", vertical: "email marketing platform", palette: "ink", font: "grotesk", radius: "12px",
    tagline: "A conversion-focused landing page for an email marketing or newsletter tool.",
    site: {
      eyebrow: "Email for teams who ship", headline: "Send email people <em>open</em>.", lede: "Signalbay is a B2B SaaS landing page: a dashboard preview, a benefits grid written for marketers, pricing by contact count and a FAQ tuned for procurement questions.",
      pills: ["14-day free trial", "No credit card", "GDPR ready"], appTitle: "Campaign performance", appCta: "New campaign", appKpis: [["Open rate", "48.2%", "+3.1%"], ["Click rate", "9.4%", "+1.2%"], ["Subscribers", "128k", "+2.4k"]],
      benefits: [s("bolt", "Drag-and-drop editor", "Build on-brand emails in minutes with reusable blocks."), s("chart", "Deliverability built in", "Warm-up, authentication checks and inbox placement reports."), s("users", "Segments that update themselves", "Behavioural segments that refresh as customers act."), s("layers", "Automations", "Welcome series, win-backs and drips with a visual builder."), s("shield", "Compliance by default", "Consent tracking, double opt-in and one-click unsubscribe."), s("globe", "Integrations", "Connect your store, CRM and forms in a couple of clicks.")],
      how: [st("Import your list", "CSV, an integration or a signup form. Consent is preserved."), st("Design once", "Your brand kit becomes a template library the whole team uses."), st("Send and learn", "Reports that show what to do next, not just what happened.")],
      plans: [plan("Starter", "$19", "/month", "Up to 2,500 contacts.", ["Unlimited sends", "Editor & templates", "Basic automations", "Email support"]), plan("Growth", "$59", "/month", "Up to 15,000 contacts.", ["Everything in Starter", "Advanced segments", "A/B testing", "Priority support"], true), plan("Scale", "$179", "/month", "Up to 75,000 contacts.", ["Everything in Growth", "Dedicated IP", "SSO & roles", "Success manager"])],
      faq: [f("Can I migrate from another platform?", "Yes — import contacts, templates and automations with our migration tool."), f("How is pricing calculated?", "By active contacts. Unsubscribed and bounced contacts are not billed."), f("Is my data stored in my region?", "Choose EU or US data residency on any plan."), f("Do you offer an API?", "A full REST API and webhooks on Growth and above.")],
      quotes: [q("Open rates up eleven points after we switched. Deliverability is real.", "Head of growth"), q("Our whole team can build a campaign now, not just one person.", "Marketing lead"), q("Migration took an afternoon.", "Founder")],
      cta: { title: "Try Signalbay free for 14 days", body: "Import your list, send your first campaign and see the difference in the reports." },
    },
  },
  {
    brand: "Draftly", vertical: "proposal & contract builder", palette: "paper", font: "serif", radius: "10px",
    tagline: "An elegant landing page for a document, proposal or e-signature tool.",
    site: {
      eyebrow: "Proposals, quotes & e-signatures", headline: "Win the work <em>before</em> the meeting.", lede: "Draftly is a landing page for a productivity tool aimed at freelancers and agencies: a document preview, benefits framed around winning clients, and simple per-seat pricing.",
      pills: ["Templates for 40 industries", "Legally binding e-signatures", "Get paid from the proposal"], appTitle: "Proposals", appCta: "New proposal", appKpis: [["Sent", "42", "this month"], ["Accepted", "68%", "+9%"], ["Avg. value", "$4,800", "+12%"]],
      benefits: [s("file", "Proposals that look designed", "Templates that adapt to your brand, with pricing tables that calculate."), s("check", "Sign in one click", "Clients sign on any device. No account needed on their side."), s("card", "Payment on acceptance", "Collect a deposit the moment a proposal is signed."), s("chart", "Know when it's read", "Open and view-time notifications so you follow up at the right moment."), s("layers", "Reusable content", "Case studies, bios and terms saved once and dropped in anywhere."), s("users", "Team library", "Shared templates with approval before anything goes out.")],
      how: [st("Pick a template", "Industry-specific proposals, quotes and contracts."), st("Personalise in minutes", "Drop in saved sections, adjust pricing, hit send."), st("Get signed and paid", "The client signs, pays the deposit and you start.")],
      plans: [plan("Solo", "$12", "/month", "For freelancers.", ["Unlimited proposals", "E-signatures", "Payment collection", "5 templates"]), plan("Studio", "$39", "/month", "Up to 5 team members.", ["Everything in Solo", "Team library", "Approvals", "Custom domain"], true), plan("Agency", "$99", "/month", "Unlimited members.", ["Everything in Studio", "CRM integrations", "Analytics", "Priority support"])],
      faq: [f("Are e-signatures legally binding?", "Yes, with an audit trail that meets common e-signature laws."), f("Can clients pay by card?", "Deposits and full payments via major processors."), f("Can I use my own contract terms?", "Upload your terms and attach them to any template."), f("Does it integrate with my CRM?", "Native integrations on Agency, plus Zapier on all plans.")],
      quotes: [q("Signed in eleven minutes. Previous record was eleven days.", "Brand designer"), q("The deposit-on-signature feature paid for the year in one week.", "Web agency"), q("Clients comment on how professional the proposals look.", "Consultant")],
      cta: { title: "Send your first proposal today", body: "Free 14-day trial, all features. Your next client is one document away." },
    },
  },
  {
    brand: "Tidewatch", vertical: "uptime & status monitoring", palette: "midnight", font: "plex", radius: "8px",
    tagline: "A developer-facing landing page for a monitoring, status-page or observability product.",
    site: {
      eyebrow: "Uptime monitoring & status pages", headline: "Know before your <em>customers</em> do.", lede: "Tidewatch is a dark, technical landing page: a live-looking dashboard preview, benefits that speak to on-call engineers, and pricing per monitor that is easy to compare.",
      pills: ["30-second checks", "Global probe network", "Free status page"], appTitle: "Monitors", appCta: "Add monitor", appKpis: [["Uptime (30d)", "99.98%", "+0.02%"], ["Incidents", "2", "-3"], ["Avg. latency", "142ms", "-18ms"]],
      benefits: [s("bolt", "Checks every 30 seconds", "HTTP, TCP, ping, DNS and keyword checks from twelve regions."), s("bell", "Alerts that reach you", "Slack, SMS, phone calls, PagerDuty and webhooks with escalation."), s("globe", "Public status pages", "Branded status pages with incident timelines and subscribers."), s("chart", "Latency insights", "Response-time charts per region so you catch slowdowns early."), s("shield", "SSL & domain expiry", "Warnings before certificates and domains lapse."), s("layers", "Heartbeats for cron jobs", "Know when a scheduled job silently stops running.")],
      how: [st("Add a URL", "Paste it, pick regions, done."), st("Choose who gets woken up", "Escalation policies and on-call schedules per team."), st("Publish a status page", "Customers subscribe, support tickets drop.")],
      plans: [plan("Hobby", "$0", "/month", "10 monitors, 3-minute checks.", ["10 monitors", "Email alerts", "1 status page", "7-day history"]), plan("Team", "$29", "/month", "50 monitors, 30-second checks.", ["50 monitors", "SMS & Slack", "On-call schedules", "1-year history"], true), plan("Business", "$99", "/month", "250 monitors, everything on.", ["250 monitors", "Phone calls", "SSO & audit log", "Custom regions"])],
      faq: [f("How fast are alerts?", "Median alert time is under 20 seconds after a confirmed failure."), f("Can I monitor private services?", "Yes, with private probes you run inside your network."), f("Is there an API?", "Every feature is available via REST API and Terraform."), f("Do status pages support custom domains?", "Yes, with automatic SSL on all paid plans.")],
      quotes: [q("Caught a regional outage twelve minutes before our users tweeted.", "SRE"), q("The status page halved our support volume during incidents.", "Support lead"), q("Heartbeat monitors found a cron job that had been dead for a month.", "Backend engineer")],
      cta: { title: "Add your first monitor in 30 seconds", body: "Free for ten monitors. No card required." },
    },
  },
  {
    brand: "Cartogram", vertical: "field-service management app", palette: "cobalt", font: "archivo", radius: "12px",
    tagline: "A practical landing page for field-service, dispatch or scheduling software.",
    site: {
      eyebrow: "Field service, scheduled", headline: "Every job, every van, <em>one screen</em>.", lede: "Cartogram is a landing page for operations software: it shows the schedule board, sells time saved per dispatcher, and prices by technician.",
      pills: ["Live technician tracking", "Offline mobile app", "Invoices from the job"], appTitle: "Today's schedule", appCta: "Dispatch job", appKpis: [["Jobs today", "64", "+8"], ["On time", "96%", "+2%"], ["Revenue", "$18.4k", "+11%"]],
      benefits: [s("cal", "Drag-and-drop dispatch", "Assign and move jobs on a board that shows drive time between them."), s("pin", "Live map", "See every technician, their next job and their ETA."), s("file", "Job sheets that work offline", "Photos, signatures and checklists sync when the signal returns."), s("card", "Quote and invoice on site", "Customers approve and pay before the van leaves."), s("bell", "Customer updates", "Automatic SMS with arrival windows and a tracking link."), s("chart", "Reports that matter", "First-time fix rate, revenue per tech, jobs per day.")],
      how: [st("Import customers and jobs", "From spreadsheets or your old system, in an afternoon."), st("Build the schedule", "Recurring jobs, travel time and skills handled automatically."), st("Run the day from your phone", "Technicians get everything they need; the office sees everything.")],
      plans: [plan("Crew", "$29", "/tech/month", "For teams up to five.", ["Scheduling board", "Mobile app", "Invoicing", "Email support"]), plan("Fleet", "$49", "/tech/month", "For growing service companies.", ["Everything in Crew", "Live tracking", "Customer SMS", "Reporting"], true), plan("Enterprise", "Custom", "", "Multiple depots and integrations.", ["Everything in Fleet", "API & integrations", "SSO", "Dedicated onboarding"])],
      faq: [f("Does the app work without signal?", "Yes — job sheets, photos and signatures sync later."), f("Can we keep our accounting software?", "Two-way sync with the major accounting platforms."), f("How long does onboarding take?", "Most teams are live within a week with our import tool."), f("Is there a minimum number of technicians?", "No minimum. Pricing is per active technician.")],
      quotes: [q("Dispatch went from two people to one, and we do more jobs.", "Operations manager"), q("Techs actually use the app because it works in basements.", "HVAC owner"), q("Getting paid on site changed our cash flow overnight.", "Plumbing company")],
      cta: { title: "See your week on one board", body: "Book a 20-minute demo with a real schedule from your business." },
    },
  },
  {
    brand: "Pocketledger", vertical: "expense & receipts app", palette: "sage", font: "manrope", radius: "16px",
    tagline: "A friendly fintech landing page for an expense, receipts or budgeting app.",
    site: {
      eyebrow: "Receipts, sorted", headline: "Expenses that <em>do themselves</em>.", lede: "Pocketledger is a consumer-fintech landing page: warm, trustworthy, with a phone-first product preview, benefits about time saved and money found, and transparent pricing.",
      pills: ["Snap a receipt, done", "Bank-grade encryption", "Export to any accountant"], appTitle: "This month", appCta: "Add expense", appKpis: [["Spent", "$2,140", "-8%"], ["Receipts", "58", "captured"], ["Claimable", "$412", "found"]],
      benefits: [s("camera", "Snap and forget", "Photograph a receipt; date, merchant, amount and tax are extracted."), s("card", "Bank sync", "Connect accounts and match receipts to transactions automatically."), s("chart", "See where it goes", "Categories that learn, and monthly reports you'll actually read."), s("file", "One-tap exports", "PDF and CSV reports formatted for accountants and tax returns."), s("users", "Shared wallets", "Split household or team expenses without a spreadsheet."), s("lock", "Private", "Encrypted at rest, and never sold. That's the whole business model.")],
      how: [st("Connect or snap", "Link a bank account or just photograph receipts as you go."), st("Let it sort", "Merchants, categories and tax handled for you."), st("Export at tax time", "A report your accountant will thank you for.")],
      plans: [plan("Free", "$0", "/month", "Up to 30 receipts a month.", ["30 receipts", "Categories", "Monthly report", "One account"]), plan("Pro", "$6", "/month", "Unlimited, with bank sync.", ["Unlimited receipts", "Bank sync", "Tax reports", "Priority support"], true), plan("Teams", "$4", "/user/month", "For small businesses.", ["Everything in Pro", "Shared wallets", "Approvals", "Accountant access"])],
      faq: [f("Is bank sync safe?", "Read-only connections through regulated providers. We never see credentials."), f("Which countries are supported?", "Bank sync in 20+ countries; receipt capture works everywhere."), f("Can my accountant log in?", "Yes, with a read-only role on Teams."), f("Can I cancel any time?", "Yes, and you keep your data and exports.")],
      quotes: [q("Found $400 in claimable expenses I'd have missed.", "Freelancer"), q("Tax return took an hour instead of a weekend.", "Small business owner"), q("The shared wallet ended the who-paid-for-groceries debate.", "Household")],
      cta: { title: "Photograph your first receipt", body: "Free for 30 receipts a month. Your accountant will notice." },
    },
  },
  {
    brand: "Lumenary", vertical: "smart lighting hardware", palette: "charcoal", font: "outfit", radius: "24px",
    tagline: "A premium product landing page for a consumer hardware or smart-home device.",
    site: {
      eyebrow: "Smart lighting, designed", headline: "Light that <em>follows the day</em>.", lede: "Lumenary is a hardware product page: big, dark, cinematic, with benefits told through moments of the day, a specifications section and a pre-order pricing block.",
      pills: ["Ships worldwide", "Works with all major assistants", "Two-year warranty"], appTitle: "Living room", appCta: "Scene", appKpis: [["Warmth", "2700K", "evening"], ["Brightness", "42%", "auto"], ["Scenes", "6", "saved"]],
      benefits: [s("sun", "Circadian by default", "Cool, bright mornings and warm, dim evenings without touching a switch."), s("bolt", "Instant response", "Local control means no lag and no cloud dependency."), s("layers", "Scenes for real life", "Reading, dinner, film and wind-down, set up in a minute."), s("globe", "Works with everything", "Matter, HomeKit, Google and Alexa out of the box."), s("leaf", "Efficient", "Nine watts for the light of a sixty-watt bulb, dimmable to one percent."), s("shield", "Built to last", "Aluminium housing, replaceable modules and a two-year warranty.")],
      how: [st("Screw it in", "Standard fittings. No hub, no wiring."), st("Open the app", "Pair in seconds. Rooms and scenes are suggested for you."), st("Forget about it", "The schedule follows the sun. Override any time with a tap.")],
      plans: [plan("Single", "$39", "per bulb", "One bulb, any room.", ["Circadian schedule", "16 million colours", "Local control", "2-year warranty"]), plan("Starter kit", "$99", "3 bulbs", "Enough for a living room.", ["3 bulbs", "Free shipping", "Scene presets", "Priority support"], true), plan("Whole home", "$279", "10 bulbs", "Every room, one app.", ["10 bulbs", "Free shipping", "Extended warranty", "Early feature access"])],
      faq: [f("Do I need a hub?", "No. Bulbs connect directly over Wi-Fi and Thread."), f("Does it work with my existing switches?", "Yes — a physical switch still works; smart features resume when it's on."), f("What is the return policy?", "30 days, no questions."), f("When does it ship?", "Pre-orders ship in order of purchase; typical lead time is shown at checkout.")],
      quotes: [q("Evenings feel calmer. That sounds silly until you try it.", "Early backer"), q("Zero lag. Every other smart bulb we owned had lag.", "Home-automation enthusiast"), q("Set it up for my parents in ten minutes. They've never opened the app since.", "Customer")],
      cta: { title: "Pre-order the starter kit", body: "Three bulbs, free shipping, two-year warranty. Ships in order of purchase." },
    },
  },
  {
    brand: "Sproutly", vertical: "plant-care companion app", palette: "lime", font: "jakarta", radius: "20px",
    tagline: "A playful, green landing page for a plant-care, gardening or hobby app.",
    site: {
      eyebrow: "Keep every plant alive", headline: "Your plants, <em>finally</em> understood.", lede: "Sproutly is a lifestyle app landing page: soft greens, a phone preview, benefits with personality and a simple free-versus-plus pricing choice.",
      pills: ["Identify 12,000+ species", "Watering reminders", "Free to start"], appTitle: "My plants", appCta: "Add plant", appKpis: [["Plants", "14", "thriving"], ["Due today", "3", "water"], ["Streak", "41 days", "no losses"]],
      benefits: [s("camera", "Identify by photo", "Point the camera; get the species, light needs and watering rhythm."), s("bell", "Reminders that adapt", "Watering schedules that adjust for season, pot size and your home's light."), s("sun", "Light meter", "Use your phone's camera to check whether a spot is bright enough."), s("search", "Diagnose problems", "Yellow leaves, pests, droop — photograph it and get a plan."), s("users", "Plant swaps", "Find people nearby to trade cuttings with."), s("file", "Care cards", "Printable care cards for gifts and plant sitters.")],
      how: [st("Add your plants", "Photograph each one; Sproutly names it and builds a schedule."), st("Follow the nudges", "Water, rotate, feed — only when it's actually needed."), st("Watch them thrive", "A photo timeline shows the growth you'd otherwise miss.")],
      plans: [plan("Free", "$0", "/month", "Up to 5 plants.", ["5 plants", "Reminders", "Identification", "Community"]), plan("Plus", "$3", "/month", "Unlimited plants and diagnostics.", ["Unlimited plants", "Problem diagnosis", "Light meter", "Care cards"], true), plan("Plus yearly", "$24", "/year", "Two months free.", ["Everything in Plus", "Family sharing", "Offline mode", "Early features"])],
      faq: [f("Does identification work offline?", "Common species are on-device; rare ones need a connection."), f("How accurate is it?", "Over 95% on common houseplants; you can always correct it."), f("Can I share with a plant sitter?", "Yes — a link with the schedule for the days you're away."), f("Is there an Android app?", "iOS and Android, with a web app for desktops.")],
      quotes: [q("Nothing has died in three months. A personal record.", "Beginner"), q("The light meter told me my monstera was basically in a cave.", "Apartment dweller"), q("Traded cuttings with two neighbours I'd never met.", "Community member")],
      cta: { title: "Add your first plant", body: "Free for five plants. Your fiddle-leaf fig will thank you." },
    },
  },
  {
    brand: "Quietdesk", vertical: "focus & deep-work timer", palette: "paper", font: "lora", radius: "8px",
    tagline: "A minimal, calm landing page for a focus, productivity or writing tool.",
    site: {
      eyebrow: "Deep work, on purpose", headline: "Ninety minutes of <em>nothing else</em>.", lede: "Quietdesk is a deliberately minimal landing page: generous white space, a serif voice, and a product story told in a few honest sentences. Ideal for indie tools with a strong point of view.",
      pills: ["Blocks distracting sites", "Works offline", "One-time purchase"], appTitle: "Session", appCta: "Start", appKpis: [["Today", "3h 10m", "focused"], ["Sessions", "2", "done"], ["Blocked", "41", "interruptions"]],
      benefits: [s("clock", "Sessions, not timers", "Ninety-minute blocks with a built-in break, based on how attention actually works."), s("shield", "Site and app blocking", "Blocks what you choose, on every device, until the session ends."), s("music", "Soundscapes", "Rain, café, wind — recorded, not generated, and loopable."), s("file", "Session notes", "A single line at the end of each block: what got done."), s("chart", "Weekly review", "A quiet report on where your focus went."), s("lock", "No account required", "Your sessions live on your device.")],
      how: [st("Choose a task", "One line. That's the whole plan."), st("Start the session", "Distractions are blocked; the soundscape starts."), st("Close the loop", "Note what got done. Take the break. Go again.")],
      plans: [plan("Trial", "$0", "7 days", "Every feature, no card.", ["Unlimited sessions", "Blocking", "Soundscapes", "Notes"]), plan("Lifetime", "$29", "once", "Buy it once, own it.", ["All features forever", "All devices", "Future updates", "No subscription"], true), plan("Team", "$19", "/seat/year", "For studios and small teams.", ["Everything in Lifetime", "Shared focus hours", "Team review", "Invoiced billing"])],
      faq: [f("Why ninety minutes?", "It maps to a natural attention cycle for most people; you can change it."), f("Can it block apps, not just websites?", "Yes, on desktop and mobile."), f("Is it really a one-time purchase?", "Yes. Updates are included. Optional team plan is yearly."), f("What data do you collect?", "None by default. Sync is opt-in and encrypted.")],
      quotes: [q("I wrote a book in ninety-minute blocks. It works.", "Author"), q("Bought it once, use it daily. The pricing is the point.", "Developer"), q("The blocking is the only one I haven't found a way around.", "Student")],
      cta: { title: "Try it free for a week", body: "No account, no card. If it helps, it's $29 forever." },
    },
  },
  {
    brand: "Fleetline", vertical: "delivery fleet & route software", palette: "slate", font: "grotesk", radius: "10px",
    tagline: "A confident B2B landing page for logistics, routing or fleet software.",
    site: {
      eyebrow: "Route optimisation for last mile", headline: "More stops, <em>fewer</em> miles.", lede: "Fleetline is an enterprise-leaning landing page with a route-planning preview, ROI-driven benefits, and pricing that leads to a demo rather than a checkout.",
      pills: ["Routes in seconds", "Proof of delivery", "Live ETAs for customers"], appTitle: "Routes — today", appCta: "Optimise", appKpis: [["Stops", "1,240", "planned"], ["Miles saved", "18%", "vs manual"], ["On time", "97.3%", "+1.1%"]],
      benefits: [s("pin", "Optimisation that respects reality", "Time windows, vehicle capacity, driver breaks and one-way streets."), s("truck", "Driver app", "Turn-by-turn, proof of delivery and instant re-routing."), s("bell", "Customer notifications", "Live tracking links and accurate ETAs cut 'where is my order' calls."), s("chart", "Cost per stop", "See what every route costs and where the savings are."), s("layers", "Multi-depot", "Plan across depots, vehicle types and shifts."), s("globe", "API-first", "Push orders in, pull routes out, from any system.")],
      how: [st("Import orders", "From your OMS, a CSV or the API."), st("Optimise", "Thousands of stops routed in seconds, with constraints honoured."), st("Dispatch and track", "Drivers get their day; customers get live ETAs.")],
      plans: [plan("Starter", "$99", "/month", "Up to 5 vehicles.", ["Route optimisation", "Driver app", "Proof of delivery", "Email support"]), plan("Growth", "$349", "/month", "Up to 25 vehicles.", ["Everything in Starter", "Customer tracking", "Analytics", "API access"], true), plan("Enterprise", "Custom", "", "Unlimited vehicles and depots.", ["Everything in Growth", "Multi-depot", "SLA & SSO", "Dedicated engineer"])],
      faq: [f("How much can we save?", "Customers typically report 15–25% fewer miles; we'll model your data in the demo."), f("Does it integrate with our WMS?", "Native connectors plus an API used by most integrators."), f("Can drivers use their own phones?", "Yes — iOS and Android, with offline maps."), f("How long to implement?", "Two to four weeks for most fleets, including driver training.")],
      quotes: [q("Same drivers, twenty percent more stops. The maths is simple.", "Logistics director"), q("'Where is my parcel' calls dropped by half in a month.", "Customer service lead"), q("Integration with our warehouse system took days, not months.", "IT manager")],
      cta: { title: "Model your routes with real data", body: "A 30-minute demo using your own stops. See the savings before you sign anything." },
    },
  },
]

/* ------------------------------------------------------------------ */
/* Dashboards (8)                                                      */
/* ------------------------------------------------------------------ */

const ok = (t) => ["ok", t], warn = (t) => ["warn", t], bad = (t) => ["bad", t], info = (t) => ["info", t]

const dashboards = [
  {
    brand: "Orbital", vertical: "SaaS analytics dashboard", palette: "midnight", font: "plex", radius: "12px",
    tagline: "A dark, data-dense admin dashboard for SaaS metrics and subscriptions.",
    site: {
      userRole: "Founder", searchHint: "customers, plans", primaryAction: "Export", title: "Overview", subtitle: "Revenue, growth and retention at a glance.",
      nav: [{ group: "Analytics", items: [["home", "Overview", "index.html"], ["chart", "Revenue", "revenue.html"], ["users", "Customers", "#"], ["layers", "Plans", "#"]] }, { group: "Manage", items: [["card", "Billing", "#"], ["bell", "Alerts", "#"], ["gear", "Settings", "settings.html"]] }],
      kpis: [["MRR", "$84,210", "+6.2% MoM"], ["Active subscriptions", "1,942", "+118"], ["Churn", "1.8%", "-0.3 pts"], ["ARPU", "$43.40", "+2.1%"]],
      chart: { title: "Monthly recurring revenue", kind: "line", values: [52, 55, 58, 61, 63, 66, 70, 72, 75, 78, 81, 84], sub: "USD, thousands" },
      breakdown: { title: "Revenue by plan", parts: [48, 34, 18], labels: ["Growth", "Starter", "Scale"] },
      table: { title: "Recent signups", cols: ["Customer", "Plan", "MRR", "Status", "Joined"], rows: [["Northwind Labs", "Growth", "$59", ok("Active"), "Today"], ["Brightline Co", "Scale", "$179", ok("Active"), "Today"], ["Fernhill Studio", "Starter", "$19", info("Trial"), "Yesterday"], ["Quarry Digital", "Growth", "$59", warn("Past due"), "2 days ago"], ["Maple & Oak", "Starter", "$19", ok("Active"), "3 days ago"], ["Harbor Freight Ltd", "Scale", "$179", bad("Cancelled"), "4 days ago"]] },
      page2: { file: "revenue.html", label: "Revenue", title: "Revenue", subtitle: "Bookings, expansion and refunds by month.", chart: { title: "New vs expansion revenue", kind: "bar", values: [12, 14, 13, 16, 18, 17, 21, 22, 24, 26, 25, 29] }, table: { title: "Invoices", cols: ["Invoice", "Customer", "Amount", "Status", "Due"], rows: [["#10482", "Northwind Labs", "$708", ok("Paid"), "—"], ["#10481", "Quarry Digital", "$59", warn("Overdue"), "3 days"], ["#10480", "Brightline Co", "$2,148", ok("Paid"), "—"], ["#10479", "Fernhill Studio", "$0", info("Trial"), "—"], ["#10478", "Maple & Oak", "$228", ok("Paid"), "—"]] } },
      settings: [{ title: "Workspace", fields: [{ label: "Company name", value: "Orbital Inc." }, { label: "Billing email", value: "finance@orbital.example" }, { label: "Currency", value: "USD" }] }, { title: "Notifications", fields: [{ type: "toggle", label: "Weekly digest", hint: "Every Monday at 9am", on: true }, { type: "toggle", label: "Churn alerts", hint: "When a customer cancels", on: true }, { type: "toggle", label: "Failed payments", hint: "Immediately", on: false }] }],
    },
  },
  {
    brand: "Ledgerlane", vertical: "finance operations dashboard", palette: "paper", font: "plex", radius: "8px",
    tagline: "A clean, light finance dashboard for invoices, cash flow and approvals.",
    site: {
      userRole: "Finance lead", searchHint: "invoices, vendors", primaryAction: "New invoice", title: "Cash position", subtitle: "What's in, what's due and what needs a signature.",
      nav: [{ group: "Finance", items: [["home", "Overview", "index.html"], ["file", "Invoices", "invoices.html"], ["card", "Payments", "#"], ["users", "Vendors", "#"]] }, { group: "Control", items: [["shield", "Approvals", "#"], ["chart", "Reports", "#"], ["gear", "Settings", "settings.html"]] }],
      kpis: [["Cash on hand", "$412,900", "+$18k this week"], ["Receivable", "$96,400", "12 invoices"], ["Payable", "$41,200", "8 bills"], ["Runway", "14 mo", "at current burn"]],
      chart: { title: "Cash flow", kind: "bar", values: [42, 38, 51, 47, 55, 49, 58, 62, 57, 66, 64, 71], sub: "Net, USD thousands" },
      breakdown: { title: "Spend by category", parts: [41, 27, 19, 13], labels: ["Payroll", "Software", "Office", "Travel"] },
      table: { title: "Awaiting approval", cols: ["Bill", "Vendor", "Amount", "Status", "Requested"], rows: [["BL-2291", "Cloudhost", "$4,120", warn("Needs review"), "1h ago"], ["BL-2290", "Studio Rent Ltd", "$6,800", info("Scheduled"), "3h ago"], ["BL-2289", "Print & Post", "$312", ok("Approved"), "Yesterday"], ["BL-2288", "Travel Co", "$1,940", warn("Needs review"), "Yesterday"], ["BL-2287", "Insurance Group", "$2,250", ok("Approved"), "2 days ago"], ["BL-2286", "Coffee Supply", "$140", bad("Rejected"), "3 days ago"]] },
      page2: { file: "invoices.html", label: "Invoices", title: "Invoices", subtitle: "Sent, paid and overdue.", chart: { title: "Days sales outstanding", kind: "line", values: [41, 39, 38, 36, 35, 33, 34, 31, 30, 29, 28, 27] }, table: { title: "Open invoices", cols: ["Invoice", "Client", "Amount", "Status", "Due"], rows: [["INV-1042", "Alder Group", "$12,400", warn("Due in 3 days"), "Fri"], ["INV-1041", "Bright Media", "$8,200", bad("Overdue 9 days"), "—"], ["INV-1040", "Clearwater", "$3,150", ok("Paid"), "—"], ["INV-1039", "Dune Studios", "$21,000", info("Sent"), "30 days"], ["INV-1038", "Elmwood", "$5,600", ok("Paid"), "—"]] } },
      settings: [{ title: "Company", fields: [{ label: "Legal name", value: "Ledgerlane Ltd" }, { label: "Tax ID", value: "GB 123 4567 89" }, { label: "Fiscal year start", value: "April" }] }, { title: "Approvals", fields: [{ type: "toggle", label: "Require two approvers over $5,000", on: true }, { type: "toggle", label: "Auto-approve recurring bills", on: false }, { type: "toggle", label: "Notify on rejection", on: true }] }],
    },
  },
  {
    brand: "Helmsman", vertical: "logistics & fleet dashboard", palette: "cobalt", font: "archivo", radius: "10px",
    tagline: "An operations dashboard for shipments, vehicles and delivery performance.",
    site: {
      userRole: "Dispatch manager", searchHint: "shipments, drivers", primaryAction: "New shipment", title: "Operations", subtitle: "Live shipments, fleet status and delivery performance.",
      nav: [{ group: "Operations", items: [["home", "Overview", "index.html"], ["truck", "Shipments", "shipments.html"], ["pin", "Live map", "#"], ["users", "Drivers", "#"]] }, { group: "Fleet", items: [["box", "Vehicles", "#"], ["chart", "Reports", "#"], ["gear", "Settings", "settings.html"]] }],
      kpis: [["Shipments today", "1,284", "+9%"], ["On-time rate", "96.8%", "+0.6 pts"], ["Vehicles active", "142 / 160", "18 in service"], ["Avg. stops / route", "38", "+2"]],
      chart: { title: "Deliveries per day", kind: "bar", values: [980, 1040, 1010, 1120, 1180, 1150, 1230, 1260, 1210, 1290, 1270, 1284], sub: "Last 12 days" },
      breakdown: { title: "Shipment status", parts: [62, 24, 9, 5], labels: ["Delivered", "In transit", "At depot", "Exception"] },
      table: { title: "Exceptions", cols: ["Shipment", "Route", "Driver", "Status", "Updated"], rows: [["SH-88123", "R-14 North", "M. Ruiz", bad("Failed delivery"), "12 min"], ["SH-88097", "R-07 Central", "H. Kowalski", warn("Delayed"), "25 min"], ["SH-88061", "R-22 East", "S. Okafor", warn("Address issue"), "41 min"], ["SH-88040", "R-03 West", "L. Fischer", ok("Resolved"), "1h"], ["SH-87995", "R-14 North", "M. Ruiz", ok("Resolved"), "2h"], ["SH-87901", "R-11 South", "N. Haddad", info("Rescheduled"), "3h"]] },
      page2: { file: "shipments.html", label: "Shipments", title: "Shipments", subtitle: "Every parcel, every status.", chart: { title: "Average delivery time", kind: "line", values: [52, 50, 49, 47, 48, 45, 44, 43, 41, 42, 40, 39] }, table: { title: "All shipments", cols: ["Shipment", "Customer", "Service", "Status", "ETA"], rows: [["SH-88140", "Fernhill Studio", "Next day", ok("Out for delivery"), "14:20"], ["SH-88139", "Alder Group", "Same day", ok("Delivered"), "—"], ["SH-88138", "Quarry Digital", "Standard", info("In transit"), "Tomorrow"], ["SH-88137", "Maple & Oak", "Next day", warn("Delayed"), "16:40"], ["SH-88136", "Bright Media", "Standard", info("At depot"), "2 days"]] } },
      settings: [{ title: "Depots", fields: [{ label: "Primary depot", value: "North Hub" }, { label: "Cut-off time", value: "18:00" }, { label: "Service area radius (km)", value: "80" }] }, { title: "Driver app", fields: [{ type: "toggle", label: "Require photo proof of delivery", on: true }, { type: "toggle", label: "Allow signature skip", on: false }, { type: "toggle", label: "Customer ETA notifications", on: true }] }],
    },
  },
  {
    brand: "Crewfolio", vertical: "HR & people-ops dashboard", palette: "plum", font: "jakarta", radius: "14px",
    tagline: "A friendly HR dashboard for headcount, leave, hiring and onboarding.",
    site: {
      userRole: "People partner", searchHint: "people, teams", primaryAction: "Add employee", title: "People", subtitle: "Headcount, time off and hiring across the company.",
      nav: [{ group: "People", items: [["home", "Overview", "index.html"], ["users", "Directory", "directory.html"], ["cal", "Time off", "#"], ["file", "Hiring", "#"]] }, { group: "Company", items: [["chart", "Reports", "#"], ["shield", "Compliance", "#"], ["gear", "Settings", "settings.html"]] }],
      kpis: [["Headcount", "248", "+6 this month"], ["Open roles", "11", "4 in final stage"], ["On leave today", "17", "6.9%"], ["Onboarding", "9", "this month"]],
      chart: { title: "Headcount growth", kind: "line", values: [196, 201, 205, 210, 214, 219, 224, 228, 233, 238, 242, 248], sub: "Employees" },
      breakdown: { title: "Headcount by department", parts: [38, 27, 18, 17], labels: ["Engineering", "Sales", "Operations", "Marketing"] },
      table: { title: "Pending requests", cols: ["Employee", "Type", "Dates", "Status", "Manager"], rows: [["Priya Natarajan", "Annual leave", "12–16 Jun", warn("Awaiting approval"), "J. Avery"], ["Samuel Okafor", "Remote work", "Jul", info("In review"), "H. Kowalski"], ["Lena Fischer", "Sick leave", "Today", ok("Approved"), "M. Ruiz"], ["Noor Haddad", "Parental leave", "Sep–Dec", ok("Approved"), "J. Avery"], ["Elliot Brennan", "Training", "3 Jul", warn("Awaiting approval"), "L. Fischer"], ["Mateo Ruiz", "Annual leave", "22–26 Jun", bad("Declined"), "S. Okafor"]] },
      page2: { file: "directory.html", label: "Directory", title: "Directory", subtitle: "Everyone, by team and location.", chart: { title: "Hires per month", kind: "bar", values: [3, 5, 4, 6, 5, 7, 6, 8, 5, 6, 7, 6] }, table: { title: "Recently joined", cols: ["Name", "Role", "Team", "Status", "Start date"], rows: [["Hannah Kowalski", "Product designer", "Product", ok("Active"), "3 Jun"], ["Elliot Brennan", "Account executive", "Sales", info("Onboarding"), "10 Jun"], ["Noor Haddad", "Data analyst", "Operations", ok("Active"), "27 May"], ["Jordan Avery", "Engineering manager", "Engineering", ok("Active"), "20 May"], ["Lena Fischer", "Content lead", "Marketing", ok("Active"), "13 May"]] } },
      settings: [{ title: "Company", fields: [{ label: "Company name", value: "Crewfolio" }, { label: "Leave year starts", value: "1 January" }, { label: "Default annual leave (days)", value: "25" }] }, { title: "Policies", fields: [{ type: "toggle", label: "Managers approve leave", on: true }, { type: "toggle", label: "Allow negative leave balance", on: false }, { type: "toggle", label: "Birthday reminders", on: true }] }],
    },
  },
  {
    brand: "Careline", vertical: "clinic operations dashboard", palette: "mint", font: "manrope", radius: "12px",
    tagline: "A calm clinic dashboard for appointments, patients and room utilisation.",
    site: {
      userRole: "Practice manager", searchHint: "patients, appointments", primaryAction: "Book appointment", title: "Today", subtitle: "Appointments, arrivals and rooms across the practice.",
      nav: [{ group: "Clinic", items: [["home", "Today", "index.html"], ["cal", "Schedule", "schedule.html"], ["users", "Patients", "#"], ["file", "Records", "#"]] }, { group: "Practice", items: [["card", "Billing", "#"], ["chart", "Reports", "#"], ["gear", "Settings", "settings.html"]] }],
      kpis: [["Appointments today", "64", "6 walk-ins"], ["Arrived", "38", "on time 92%"], ["Rooms in use", "7 / 9", "78%"], ["No-shows", "2", "-3 vs avg"]],
      chart: { title: "Appointments per week", kind: "bar", values: [290, 305, 298, 320, 312, 330, 341, 338, 352, 349, 360, 366], sub: "Last 12 weeks" },
      breakdown: { title: "Visit types", parts: [46, 28, 16, 10], labels: ["Check-up", "Treatment", "Follow-up", "Emergency"] },
      table: { title: "Up next", cols: ["Time", "Patient", "Clinician", "Status", "Room"], rows: [["10:30", "Priya N.", "Dr Avery", ok("Arrived"), "Room 2"], ["10:45", "Mateo R.", "Dr Fischer", info("Confirmed"), "Room 4"], ["11:00", "Hannah K.", "Dr Avery", warn("Running late"), "Room 2"], ["11:15", "Samuel O.", "Hygienist", ok("Arrived"), "Room 6"], ["11:30", "Noor H.", "Dr Okafor", info("Confirmed"), "Room 1"], ["11:45", "Elliot B.", "Dr Fischer", bad("No-show risk"), "Room 4"]] },
      page2: { file: "schedule.html", label: "Schedule", title: "Schedule", subtitle: "Clinicians and rooms for the week.", chart: { title: "Room utilisation", kind: "line", values: [61, 64, 66, 70, 68, 72, 75, 74, 78, 77, 80, 78] }, table: { title: "Clinician availability", cols: ["Clinician", "Mon", "Tue", "Wed", "Status", "Notes"], rows: [["Dr Avery", "9–5", "9–5", "9–1", ok("Available"), "Half day Wed"], ["Dr Fischer", "8–4", "—", "8–4", warn("Reduced"), "Training Tue"], ["Dr Okafor", "10–6", "10–6", "10–6", ok("Available"), "—"], ["Hygienist", "9–5", "9–5", "9–5", ok("Available"), "—"], ["Locum", "—", "9–5", "—", info("Booked"), "Cover"]] } },
      settings: [{ title: "Practice", fields: [{ label: "Practice name", value: "Careline Health" }, { label: "Opening hours", value: "08:00–18:00" }, { label: "Default appointment length (min)", value: "20" }] }, { title: "Patient communication", fields: [{ type: "toggle", label: "SMS reminders 24h before", on: true }, { type: "toggle", label: "Email recall reminders", on: true }, { type: "toggle", label: "Allow online rescheduling", on: false }] }],
    },
  },
  {
    brand: "Campusone", vertical: "school & education admin dashboard", palette: "ocean", font: "sora", radius: "14px",
    tagline: "A school administration dashboard for attendance, classes, fees and staff.",
    site: {
      userRole: "Registrar", searchHint: "students, classes", primaryAction: "Enrol student", title: "Campus overview", subtitle: "Attendance, enrolment and fees for the current term.",
      nav: [{ group: "Academic", items: [["home", "Overview", "index.html"], ["users", "Students", "students.html"], ["cal", "Timetable", "#"], ["file", "Grades", "#"]] }, { group: "Administration", items: [["card", "Fees", "#"], ["chart", "Reports", "#"], ["gear", "Settings", "settings.html"]] }],
      kpis: [["Students", "1,184", "+42 this term"], ["Attendance today", "95.1%", "+0.8 pts"], ["Fees collected", "88%", "of term"], ["Staff present", "96 / 101", "5 absent"]],
      chart: { title: "Attendance rate", kind: "line", values: [92.1, 93.4, 94.0, 93.8, 94.6, 95.2, 94.9, 95.5, 95.8, 95.1, 95.6, 95.1], sub: "Percent, last 12 weeks" },
      breakdown: { title: "Students by year group", parts: [26, 25, 25, 24], labels: ["Year 7–8", "Year 9–10", "Year 11–12", "Sixth form"] },
      table: { title: "Today's alerts", cols: ["Student", "Class", "Issue", "Status", "Owner"], rows: [["A. Morgan", "9B", "Absent, unexplained", bad("Contact parent"), "Office"], ["T. Lindberg", "11A", "Late x3 this week", warn("Follow up"), "Form tutor"], ["R. Okafor", "7C", "Fees overdue", warn("Reminder sent"), "Bursar"], ["J. Patel", "12S", "Medical note received", ok("Cleared"), "Office"], ["M. Chen", "10D", "Timetable clash", info("Rescheduled"), "Registrar"], ["S. Alvarez", "8A", "New enrolment", ok("Complete"), "Registrar"]] },
      page2: { file: "students.html", label: "Students", title: "Students", subtitle: "Enrolment and records.", chart: { title: "Enrolments per month", kind: "bar", values: [12, 8, 15, 9, 22, 31, 40, 18, 11, 14, 9, 13] }, table: { title: "Recent enrolments", cols: ["Student", "Year", "Form", "Status", "Enrolled"], rows: [["S. Alvarez", "8", "8A", ok("Active"), "Today"], ["K. Nakamura", "7", "7B", info("Documents pending"), "Yesterday"], ["L. Dubois", "10", "10C", ok("Active"), "2 days ago"], ["P. Mensah", "12", "12S", ok("Active"), "3 days ago"], ["E. Rossi", "9", "9D", warn("Fees pending"), "4 days ago"]] } },
      settings: [{ title: "School", fields: [{ label: "School name", value: "Campusone Academy" }, { label: "Current term", value: "Autumn" }, { label: "Attendance threshold (%)", value: "90" }] }, { title: "Parent communication", fields: [{ type: "toggle", label: "Absence SMS by 10am", on: true }, { type: "toggle", label: "Weekly attendance email", on: false }, { type: "toggle", label: "Fee reminders", on: true }] }],
    },
  },
  {
    brand: "Deskflow", vertical: "customer support desk dashboard", palette: "slate", font: "grotesk", radius: "10px",
    tagline: "A support-desk dashboard for ticket queues, SLAs and agent performance.",
    site: {
      userRole: "Support lead", searchHint: "tickets, customers", primaryAction: "New ticket", title: "Queue", subtitle: "Open tickets, response times and who's on shift.",
      nav: [{ group: "Support", items: [["home", "Queue", "index.html"], ["chat", "Tickets", "tickets.html"], ["users", "Customers", "#"], ["file", "Knowledge base", "#"]] }, { group: "Team", items: [["chart", "Performance", "#"], ["bell", "SLAs", "#"], ["gear", "Settings", "settings.html"]] }],
      kpis: [["Open tickets", "142", "-18 today"], ["First response", "26 min", "-9 min"], ["SLA met", "97.4%", "+1.2 pts"], ["CSAT", "4.7 / 5", "+0.1"]],
      chart: { title: "Tickets per day", kind: "bar", values: [120, 134, 128, 141, 150, 138, 129, 146, 152, 140, 137, 142], sub: "Created, last 12 days" },
      breakdown: { title: "Tickets by channel", parts: [52, 28, 14, 6], labels: ["Email", "Chat", "Phone", "Social"] },
      table: { title: "Needs attention", cols: ["Ticket", "Subject", "Customer", "Status", "SLA"], rows: [["#4821", "Payment failed twice", "Alder Group", bad("Breaching in 12m"), "Urgent"], ["#4819", "Cannot export report", "Bright Media", warn("Waiting on agent"), "1h 40m"], ["#4815", "Feature request: SSO", "Clearwater", info("Pending product"), "—"], ["#4810", "Login loop on mobile", "Dune Studios", warn("Waiting on agent"), "2h 10m"], ["#4802", "Invoice address change", "Elmwood", ok("Resolved"), "—"], ["#4798", "Refund request", "Fernhill Studio", info("Waiting on customer"), "—"]] },
      page2: { file: "tickets.html", label: "Tickets", title: "Tickets", subtitle: "All conversations across channels.", chart: { title: "Median resolution time (hours)", kind: "line", values: [9.2, 8.8, 8.1, 7.9, 7.4, 7.0, 6.8, 6.5, 6.1, 6.0, 5.8, 5.6] }, table: { title: "Recent tickets", cols: ["Ticket", "Subject", "Agent", "Status", "Updated"], rows: [["#4823", "API rate limit question", "P. Natarajan", ok("Resolved"), "5 min"], ["#4822", "Add second admin", "S. Okafor", info("Open"), "12 min"], ["#4821", "Payment failed twice", "Unassigned", bad("Urgent"), "14 min"], ["#4820", "Export to CSV", "L. Fischer", ok("Resolved"), "30 min"], ["#4819", "Cannot export report", "H. Kowalski", warn("Waiting"), "1h"]] } },
      settings: [{ title: "Desk", fields: [{ label: "Support email", value: "help@deskflow.example" }, { label: "Business hours", value: "Mon–Fri 09:00–18:00" }, { label: "Default SLA (hours)", value: "4" }] }, { title: "Automation", fields: [{ type: "toggle", label: "Auto-assign by round robin", on: true }, { type: "toggle", label: "Close resolved tickets after 3 days", on: true }, { type: "toggle", label: "CSAT survey on close", on: true }] }],
    },
  },
  {
    brand: "Keystone", vertical: "real-estate CRM dashboard", palette: "sand", font: "outfit", radius: "12px",
    tagline: "A property CRM dashboard for listings, leads, viewings and pipeline.",
    site: {
      userRole: "Branch manager", searchHint: "listings, leads", primaryAction: "Add listing", title: "Pipeline", subtitle: "Listings, leads and viewings across the branch.",
      nav: [{ group: "Sales", items: [["home", "Pipeline", "index.html"], ["home", "Listings", "listings.html"], ["users", "Leads", "#"], ["cal", "Viewings", "#"]] }, { group: "Branch", items: [["chart", "Reports", "#"], ["file", "Documents", "#"], ["gear", "Settings", "settings.html"]] }],
      kpis: [["Active listings", "86", "+6 this week"], ["New leads", "47", "+12%"], ["Viewings booked", "63", "this week"], ["Offers accepted", "9", "£4.1m"]],
      chart: { title: "Leads per week", kind: "bar", values: [28, 31, 35, 33, 39, 42, 40, 44, 47, 45, 49, 47], sub: "Last 12 weeks" },
      breakdown: { title: "Lead source", parts: [44, 26, 18, 12], labels: ["Portals", "Website", "Referral", "Walk-in"] },
      table: { title: "Hot leads", cols: ["Lead", "Looking for", "Budget", "Status", "Next step"], rows: [["Priya N.", "3-bed house", "$650k", ok("Viewing booked"), "Sat 11:00"], ["Mateo R.", "2-bed flat", "$420k", warn("No reply 3 days"), "Call"], ["Hannah K.", "Family home", "$900k", info("Offer pending"), "Chase vendor"], ["Samuel O.", "Investment flat", "$300k", ok("Viewing booked"), "Thu 15:30"], ["Lena F.", "Garden flat", "$480k", warn("Needs mortgage"), "Refer broker"], ["Noor H.", "Rental", "$2,200/mo", ok("Application"), "Referencing"]] },
      page2: { file: "listings.html", label: "Listings", title: "Listings", subtitle: "Every property on the market with this branch.", chart: { title: "Days on market", kind: "line", values: [34, 33, 31, 30, 28, 27, 26, 25, 24, 23, 22, 21] }, table: { title: "Active listings", cols: ["Address", "Type", "Price", "Status", "Views"], rows: [["12 Elm Road", "3-bed terrace", "$625,000", ok("Under offer"), "1,240"], ["Flat 4, Dock House", "2-bed flat", "$415,000", info("Live"), "980"], ["The Old Rectory", "5-bed detached", "$1.2m", warn("Price review"), "2,110"], ["8 Mill Lane", "Garden flat", "$470,000", ok("Viewing this week"), "760"], ["Unit 3, Foundry Yard", "Studio", "$260,000", info("Live"), "430"]] } },
      settings: [{ title: "Branch", fields: [{ label: "Branch name", value: "Keystone Central" }, { label: "Lead response target (min)", value: "30" }, { label: "Default fee (%)", value: "1.25" }] }, { title: "Portals", fields: [{ type: "toggle", label: "Auto-publish to portals", on: true }, { type: "toggle", label: "Sync price changes", on: true }, { type: "toggle", label: "Import portal leads", on: true }] }],
    },
  },
]

/* ------------------------------------------------------------------ */
/* Storefronts (8)                                                     */
/* ------------------------------------------------------------------ */

const stores = [
  {
    brand: "Vellum & Vine", vertical: "stationery & paper goods store", palette: "paper", font: "serif", radius: "6px",
    tagline: "A tactile, editorial storefront for a stationery, paper or gift brand.",
    site: {
      promo: "Free shipping on orders over $50 · New notebooks just landed", eyebrow: "Paper goods, made slowly", headline: "Notebooks worth <em>finishing</em>.", lede: "Vellum & Vine is a storefront template for makers: a warm paper palette, product cards that show texture, and a product page with variants, swatches and honest details.", heroLabel: "New season",
      cats: ["Notebooks", "Planners", "Pens & ink", "Gift sets"],
      products: [pr("Linen notebook, dotted", "A5 · 192 pages", "$24", ["#c2410c", "#f5e6d3"], "New"), pr("Weekly planner 2026", "A5 · undated", "$32", ["#0f766e", "#e6f1ee"]), pr("Fountain pen, brass", "Medium nib", "$68", ["#7c5a2b", "#efe3cf"], "Best seller"), pr("Ink trio", "3 × 30ml", "$36", ["#1e3a5f", "#dbe4f0"]), pr("Pocket journal set", "3 × A6", "$18", ["#be123c", "#f6dfe3"]), pr("Desk pad", "A3 · 50 sheets", "$22", ["#4d7c0f", "#e8f0dc"]), pr("Letter set", "20 sheets · 10 envelopes", "$16", ["#7e22ce", "#ece0f7"]), pr("Gift box: the writer", "Notebook, pen, ink", "$89", ["#c2410c", "#0f766e"], "Gift", "$102")],
      pdp: 0, pdpDesc: "A5 notebook bound in washed linen with 192 pages of 100gsm dotted paper that takes fountain-pen ink without bleed. Lies flat from the first page.", pdpBullets: ["100gsm acid-free paper", "Lay-flat sewn binding", "Ribbon marker and back pocket", "Made in small batches"],
      trust: [["truck", "Free shipping over $50"], ["shield", "30-day returns"], ["leaf", "FSC-certified paper"], ["heart", "Made in small batches"]],
      about: ["Vellum & Vine's storefront pattern suits any brand that sells objects with texture: the palette is warm paper, the type is a classic serif, and the product cards give the artwork room.", "The template ships with a home page, a shop grid, a product page with variants, and a cart — every page a shop needs before the checkout hand-off."],
    },
  },
  {
    brand: "Northstitch", vertical: "apparel & streetwear store", palette: "charcoal", font: "archivo", radius: "4px",
    tagline: "A bold, drop-driven storefront for an apparel, streetwear or merch brand.",
    site: {
      promo: "Drop 07 is live · Limited sizes", eyebrow: "Drop 07 — out now", headline: "Built for <em>daily wear</em>.", lede: "Northstitch is a high-contrast apparel storefront: oversized type, a drop-style hero, a product grid with size and colour variants and a cart that feels fast.", heroLabel: "Drop 07",
      cats: ["Tees", "Hoodies", "Outerwear", "Accessories"],
      products: [pr("Heavyweight tee", "320gsm · boxy", "$38", ["#f5b301", "#1f1f1f"], "Drop 07"), pr("Zip hoodie", "Brushed fleece", "$88", ["#38bdf8", "#111827"]), pr("Work jacket", "Canvas · lined", "$148", ["#a3a3a3", "#262626"], "Limited"), pr("Cargo pant", "Ripstop", "$96", ["#4d7c0f", "#1c1917"]), pr("Beanie", "Merino", "$28", ["#e0563b", "#1f1f1f"]), pr("Crewneck", "French terry", "$72", ["#7c8cff", "#0f1220"]), pr("Tote", "18oz canvas", "$24", ["#f5b301", "#0a0a0a"]), pr("Cap", "Unstructured", "$32", ["#22d3ee", "#171717"], "Restock")],
      pdp: 0, pdpDesc: "A 320gsm heavyweight cotton tee with a boxy cut, dropped shoulder and a ribbed collar that keeps its shape. Garment-dyed for a lived-in colour from day one.", pdpBullets: ["320gsm organic cotton", "Boxy fit, dropped shoulder", "Garment-dyed", "Screen-printed graphic"],
      trust: [["truck", "Ships in 24 hours"], ["shield", "Free exchanges"], ["users", "Unisex sizing XS–XXL"], ["lock", "Secure checkout"]],
      about: ["Northstitch is built around the drop: a countdown-ready hero, product cards with limited badges, and a product page whose size selector and swatches are the first things a customer sees.", "The dark palette and condensed type make product photography pop, and every page is tuned for one-handed phone shopping."],
    },
  },
  {
    brand: "Terrafirma", vertical: "ceramics & homeware store", palette: "clay", font: "editorial", radius: "10px",
    tagline: "A calm, gallery-like storefront for ceramics, homeware or handmade goods.",
    site: {
      promo: "Studio sale — seconds 30% off this week", eyebrow: "Handmade in the studio", headline: "Objects for <em>every day</em>.", lede: "Terrafirma is a homeware storefront that feels like a quiet shop: clay tones, generous whitespace, and product pages that explain how each piece is made and cared for.", heroLabel: "Studio collection",
      cats: ["Tableware", "Vases", "Lighting", "Seconds"],
      products: [pr("Stoneware mug", "350ml · speckled", "$28", ["#b45309", "#f3e6d8"], "Best seller"), pr("Dinner plate", "27cm", "$42", ["#0369a1", "#dcebf5"]), pr("Bud vase", "Hand-thrown", "$34", ["#7a6a60", "#efe6df"]), pr("Serving bowl", "30cm", "$68", ["#c2410c", "#f6e3d6"]), pr("Table lamp", "Ceramic base, linen shade", "$140", ["#2c1f1a", "#e8dfd6"], "New"), pr("Espresso cup set", "2 × 90ml", "$36", ["#0f766e", "#dfeeea"]), pr("Planter", "18cm · drainage", "$46", ["#8a5a2b", "#f1e4d3"]), pr("Seconds mug", "Minor glaze marks", "$18", ["#b45309", "#d6c3b0"], "Seconds", "$28")],
      pdp: 0, pdpDesc: "A speckled stoneware mug thrown on the wheel, glazed in a satin oatmeal and fired twice. Holds 350ml and sits comfortably in the hand. Dishwasher and microwave safe.", pdpBullets: ["Hand-thrown stoneware", "Food-safe satin glaze", "Dishwasher & microwave safe", "Each piece slightly different"],
      trust: [["truck", "Carefully packed, tracked shipping"], ["shield", "Arrives intact or replaced"], ["leaf", "Made in our studio"], ["heart", "Seconds sold honestly"]],
      about: ["Terrafirma's product page includes a 'how it's made' details block and a care section, because handmade buyers want to know both. The seconds category is a pattern for selling imperfect stock honestly.", "The layout suits ceramics, glass, textiles and any small-batch homeware brand."],
    },
  },
  {
    brand: "Bloomhaus", vertical: "florist & plant shop", palette: "rose", font: "sora", radius: "18px",
    tagline: "A fresh, delivery-focused storefront for a florist or plant shop.",
    site: {
      promo: "Same-day delivery on orders before 1pm", eyebrow: "Fresh flowers, delivered today", headline: "Say it with <em>stems</em>.", lede: "Bloomhaus is a florist storefront built for gifting: occasion categories, same-day delivery messaging, and a product page with a gift-message field and delivery-date picker.", heroLabel: "Seasonal bouquets",
      cats: ["Bouquets", "Plants", "Occasions", "Subscriptions"],
      products: [pr("The Sunday bouquet", "Seasonal mix", "$45", ["#be123c", "#fbe4ea"], "Same-day"), pr("Peony bunch", "10 stems", "$58", ["#f472b6", "#fce7f3"], "Seasonal"), pr("Monstera", "In terracotta pot", "$52", ["#0f766e", "#dff0ec"]), pr("Dried grasses", "Everlasting", "$38", ["#c98a2e", "#f7ecd8"]), pr("Birthday box", "Bouquet & candle", "$68", ["#7e22ce", "#efe4f9"], "Gift"), pr("Weekly subscription", "From", "$32/wk", ["#be123c", "#0f766e"]), pr("Olive tree", "60cm", "$74", ["#4d7c0f", "#e9f1dc"]), pr("Sympathy arrangement", "White & green", "$65", ["#6b7280", "#eef0f3"])],
      pdp: 0, pdpDesc: "A hand-tied bouquet of whatever is best at the market this week, wrapped in paper and delivered in water. Add a handwritten card at checkout.", pdpBullets: ["Same-day delivery before 1pm", "Hand-tied by our florists", "Delivered in water", "Handwritten card option"],
      trust: [["truck", "Same-day delivery"], ["heart", "Freshness guaranteed 7 days"], ["cal", "Choose your delivery date"], ["leaf", "Local growers first"]],
      about: ["Bloomhaus is designed for the gift buyer in a hurry: occasion tiles on the homepage, delivery promises above the fold, and a product page that asks for the message and the date in the right order.", "The subscription product card pattern is included for recurring flowers."],
    },
  },
  {
    brand: "Ridgepack", vertical: "outdoor gear store", palette: "forest", font: "grotesk", radius: "8px",
    tagline: "A rugged, spec-driven storefront for outdoor, cycling or adventure gear.",
    site: {
      promo: "Free returns for 60 days · Lifetime repairs", eyebrow: "Gear tested on real trails", headline: "Pack light. Go <em>far</em>.", lede: "Ridgepack is an outdoor gear storefront where specifications matter: weight, capacity and materials appear on the product card, and the product page leads with a comparison-friendly spec table.", heroLabel: "Trail series",
      cats: ["Packs", "Shelter", "Layers", "Footwear"],
      products: [pr("Ridge 38 pack", "38L · 980g", "$168", ["#6ee7a8", "#152219"], "Best seller"), pr("Ultralight tent", "2P · 1.1kg", "$389", ["#fbbf24", "#0e1a14"]), pr("Down jacket", "800 fill · 310g", "$229", ["#38bdf8", "#111827"]), pr("Trail runner", "Vibram · 270g", "$139", ["#e0563b", "#1c1917"], "New"), pr("Merino base layer", "180gsm", "$78", ["#95a99c", "#1f2a24"]), pr("Titanium pot", "750ml · 95g", "$42", ["#a3a3a3", "#0f1720"]), pr("Rain shell", "3-layer · 240g", "$199", ["#22d3ee", "#0b0f19"]), pr("Trekking poles", "Carbon · pair", "$120", ["#fbbf24", "#1a2410"])],
      pdp: 0, pdpDesc: "A 38-litre pack built for three-day trips: a ventilated back panel, hipbelt pockets you can reach on the move, and a roll-top that shrinks the pack when it's half full. 980g, fully featured.", pdpBullets: ["38L, 980g", "Ventilated back panel", "Roll-top with side compression", "Lifetime repair guarantee"],
      trust: [["truck", "Free shipping over $99"], ["shield", "60-day trail returns"], ["wrench", "Lifetime repairs"], ["leaf", "Recycled fabrics where it counts"]],
      about: ["Ridgepack puts numbers where outdoor buyers look for them. The product card shows weight and capacity; the product page has a spec section and a 'tested on' note.", "The dark forest palette keeps product photography vivid and the layout works as well for cycling or climbing gear."],
    },
  },
  {
    brand: "Cocoa & Co", vertical: "chocolate & confectionery store", palette: "clay", font: "lora", radius: "14px",
    tagline: "An indulgent, gift-ready storefront for chocolate, coffee or artisan food.",
    site: {
      promo: "Gift boxes ship with a handwritten note", eyebrow: "Bean to bar, in small batches", headline: "Chocolate with an <em>origin</em>.", lede: "Cocoa & Co is a food storefront with warm tones and generous product imagery: origin details on each bar, gift bundles, and subscription boxes as first-class products.", heroLabel: "Single origin",
      cats: ["Bars", "Gift boxes", "Hot chocolate", "Subscriptions"],
      products: [pr("Madagascar 72%", "Single origin · 70g", "$9", ["#7a3b1e", "#f3e3d3"], "Award"), pr("Sea salt & caramel 55%", "Milk · 70g", "$8", ["#b45309", "#f6e8d8"], "Best seller"), pr("Tasting flight", "6 bars", "$48", ["#4a2c2a", "#eedfd5"], "Gift"), pr("Drinking chocolate", "Flakes · 250g", "$16", ["#0369a1", "#dbe8f1"]), pr("Peru 80%", "Single origin · 70g", "$9", ["#5c4033", "#efe1d2"]), pr("Monthly box", "3 bars, every month", "$24/mo", ["#c2410c", "#7a3b1e"]), pr("Truffle dozen", "Assorted", "$28", ["#2c1f1a", "#e8d9cd"]), pr("Corporate gift set", "10 × 70g", "$85", ["#b45309", "#2c1f1a"])],
      pdp: 0, pdpDesc: "A 72% dark bar from a single Madagascan estate, with the bright red-fruit notes the region is known for. Roasted, ground and tempered in our workshop in batches of forty kilos.", pdpBullets: ["Single-estate cocoa", "Two ingredients: cocoa and cane sugar", "Vegan, gluten-free", "Best before 12 months"],
      trust: [["truck", "Ships in insulated packaging"], ["heart", "Handwritten gift notes"], ["leaf", "Direct-trade cocoa"], ["shield", "Arrives perfect or replaced"]],
      about: ["Cocoa & Co's product page leads with origin and tasting notes because that is what premium food buyers compare. Subscription and gift products are built into the grid rather than bolted on.", "The template suits chocolate, coffee, tea and any artisan food brand."],
    },
  },
  {
    brand: "Kindred Kids", vertical: "children's toys & gifts store", palette: "lime", font: "jakarta", radius: "22px",
    tagline: "A joyful, parent-friendly storefront for toys, kids' clothing or gifts.",
    site: {
      promo: "Gift wrapping included · Free shipping over $40", eyebrow: "Toys that last past Tuesday", headline: "Play that <em>grows</em> with them.", lede: "Kindred Kids is a family storefront with age-based categories, safety details on every product page, and a cheerful palette that stays readable for tired parents.", heroLabel: "Ages 1–8",
      cats: ["0–2 years", "3–5 years", "6–8 years", "Gift sets"],
      products: [pr("Wooden stacking rings", "Ages 1+", "$24", ["#4d7c0f", "#eaf2dc"], "Best seller"), pr("Rainbow blocks set", "Ages 3+ · 24 pieces", "$42", ["#c2410c", "#fbe5d8"]), pr("Balance bike", "Ages 2–5", "$110", ["#0369a1", "#dbe8f2"], "New"), pr("Magnetic tiles", "Ages 3+ · 60 pieces", "$58", ["#7e22ce", "#ece1f8"]), pr("Story cards", "Ages 4+", "$16", ["#be123c", "#fbe3e8"]), pr("Play kitchen", "Ages 3+", "$140", ["#c98a2e", "#f8ecd8"]), pr("Puzzle trio", "Ages 5+", "$28", ["#0f766e", "#dff0ec"]), pr("Birthday gift box", "Curated by age", "$55", ["#4d7c0f", "#c2410c"], "Gift")],
      pdp: 0, pdpDesc: "Five smooth beech rings on a rounded base, finished with water-based colour. Sized for small hands and tested to toy-safety standards. A first toy that outlasts the box it came in.", pdpBullets: ["Solid beech, water-based finish", "Tested to toy-safety standards", "Ages 12 months and up", "Gift wrapping included"],
      trust: [["shield", "Safety tested"], ["truck", "Free shipping over $40"], ["heart", "Gift wrapping included"], ["users", "Age guidance on every product"]],
      about: ["Kindred Kids sorts by age because that is how parents shop. Product cards carry the age range, and the product page has a safety details block above the fold.", "Rounded shapes and a bright-but-calm palette keep it playful without becoming loud."],
    },
  },
  {
    brand: "Auralite", vertical: "audio & headphones store", palette: "ink", font: "outfit", radius: "12px",
    tagline: "A sleek, tech-forward storefront for audio gear, headphones or electronics.",
    site: {
      promo: "Free 2-day shipping · 45-day trial on all headphones", eyebrow: "Sound, taken seriously", headline: "Hear the <em>whole</em> mix.", lede: "Auralite is an electronics storefront with a dark, product-first design: feature callouts on the product page, a comparison-ready spec list and trust signals for higher-ticket purchases.", heroLabel: "Studio series",
      cats: ["Headphones", "Earbuds", "Speakers", "Accessories"],
      products: [pr("Studio over-ear", "Closed back · wired", "$249", ["#7c8cff", "#171b2e"], "Best seller"), pr("Wireless ANC", "40h battery", "$299", ["#22d3ee", "#0f1220"], "New"), pr("True wireless buds", "8h + case", "$159", ["#9aa0b8", "#171b2e"]), pr("Desktop speakers", "Pair · 60W", "$389", ["#f472b6", "#0f1220"]), pr("DAC / amp", "Balanced out", "$199", ["#34d399", "#111827"]), pr("Portable speaker", "IP67 · 20h", "$129", ["#fbbf24", "#171b2e"]), pr("Replacement pads", "Velour · pair", "$29", ["#9aa0b8", "#0f1220"]), pr("Cable, balanced", "1.5m", "$39", ["#7c8cff", "#0b0f19"])],
      pdp: 0, pdpDesc: "Closed-back studio headphones with 45mm drivers tuned flat for mixing and editing. Replaceable pads and cable, a detachable design that survives a decade of sessions, and enough isolation for a busy office.", pdpBullets: ["45mm drivers, flat response", "Replaceable pads and cable", "Folding, with hard case", "45-day home trial"],
      trust: [["truck", "Free 2-day shipping"], ["clock", "45-day trial"], ["shield", "2-year warranty"], ["wrench", "Repairs and spares available"]],
      about: ["Auralite's product page has a feature block for the three things that sell audio gear — sound, comfort and battery — followed by the full spec list and the trial and warranty details that reassure a higher-ticket buyer.", "The dark palette and restrained accent suit any premium electronics brand."],
    },
  },
]

/* ------------------------------------------------------------------ */
/* Next.js starters (8)                                                */
/* ------------------------------------------------------------------ */

const nextjs = [
  {
    brand: "Nimbus", vertical: "SaaS marketing site starter", palette: "slate", font: "grotesk", radius: "12px",
    tagline: "A Next.js 15 App Router starter for a SaaS marketing site with pricing and blog-ready routes.",
    site: {
      eyebrow: "Next.js 15 · App Router · TypeScript", headline: "Ship your marketing site <em>this week</em>.", lede: "Nimbus is a production-ready Next.js starter: typed components, a pricing route, metadata and Open Graph wired up, and a design system you can retheme from one file.",
      pills: ["App Router", "TypeScript strict", "Zero runtime CSS"], appTitle: "Deployments", appCta: "Deploy", appKpis: [["Lighthouse", "100", "perf"], ["Build", "38s", "-6s"], ["Routes", "12", "static"]],
      benefits: [s("bolt", "Fast by default", "Static routes, optimised images and fonts, no client JavaScript where none is needed."), s("layers", "Component library", "Header, hero, features, pricing, FAQ, CTA and footer as typed components."), s("file", "Metadata done right", "Titles, descriptions, Open Graph and sitemap generated from one config."), s("gear", "Theme tokens", "Colours, radius and type in a single CSS file; dark mode included."), s("chart", "Analytics-ready", "A single hook for page-view tracking with any provider."), s("shield", "Accessible", "Semantic markup, focus states and reduced-motion support throughout.")],
      how: [st("Clone and install", "One command. Node 18+, pnpm or npm."), st("Edit site.config.ts", "Name, links, pricing and metadata live in one typed file."), st("Deploy anywhere", "Vercel, Netlify or a container — no vendor lock-in.")],
      plans: [plan("Starter", "$0", "/month", "For side projects.", ["1 project", "Community support", "Basic analytics", "Nimbus branding"]), plan("Pro", "$29", "/month", "For products with customers.", ["Unlimited projects", "Priority support", "Custom domains", "No branding"], true), plan("Team", "$79", "/month", "For companies.", ["Everything in Pro", "SSO", "Audit log", "SLA"])],
      faq: [f("Which Next.js version?", "Next.js 15 with the App Router and React 19."), f("Does it use Tailwind?", "No — plain CSS with design tokens, so there is nothing to configure or purge."), f("Is there a CMS?", "Blog and docs routes read Markdown; swap in any headless CMS."), f("Can I use it commercially?", "Yes, under the licence you purchase.")],
      quotes: [q("Replaced our three-year-old marketing site in an afternoon.", "Founder"), q("Lighthouse 100 out of the box. We just changed the colours.", "Frontend engineer"), q("The typed config is the feature. No hunting through components.", "Developer")],
      cta: { title: "Start from Nimbus", body: "Download, rename, deploy. Your marketing site is a config file away." },
      stack: ["Next.js 15", "React 19", "TypeScript", "CSS design tokens"],
    },
  },
  {
    brand: "Stackline", vertical: "developer documentation site starter", palette: "ink", font: "plex", radius: "8px",
    tagline: "A Next.js documentation starter with sidebar navigation, search-ready structure and code blocks.",
    site: {
      eyebrow: "Docs that developers don't hate", headline: "Documentation, <em>shipped</em>.", lede: "Stackline is a docs site starter for APIs, SDKs and internal platforms: a three-column layout, Markdown-driven pages, a table of contents and a homepage that explains what the product does in ten seconds.",
      pills: ["Markdown pages", "Sidebar & TOC", "Dark by default"], appTitle: "API reference", appCta: "Try it", appKpis: [["Endpoints", "48", "documented"], ["Pages", "126", "built"], ["Search", "<50ms", "p95"]],
      benefits: [s("file", "Write in Markdown", "Every page is a Markdown file with front-matter. Routes generate themselves."), s("layers", "Three-column layout", "Sidebar navigation, content and an on-page table of contents."), s("search", "Search-ready", "Structured headings and a search index generated at build time."), s("bolt", "Code blocks that copy", "Syntax highlighting, line numbers and a copy button."), s("globe", "Versioned docs", "A version switcher pattern for multiple releases."), s("gear", "Config-driven nav", "The sidebar is a typed tree in one file.")],
      how: [st("Add a Markdown file", "Drop it in the content folder; it appears in the sidebar."), st("Group and order", "Front-matter controls sections, order and version."), st("Build and deploy", "Static output, hosted anywhere.")],
      plans: [plan("Open source", "$0", "", "For public projects.", ["All layouts", "Markdown & MDX", "Search index", "Community support"]), plan("Product", "$49", "/month", "For commercial docs.", ["Everything in Open source", "Versioning", "Analytics", "Priority support"], true), plan("Platform", "$149", "/month", "For large API surfaces.", ["Everything in Product", "OpenAPI import", "Multi-site", "SLA"])],
      faq: [f("Does it support MDX?", "Yes — components inside Markdown for callouts, tabs and demos."), f("Can I import an OpenAPI spec?", "A generator pattern is included for reference pages."), f("Is search included?", "A build-time index and a client-side search component are included."), f("Light mode?", "A toggle is included; dark is the default.")],
      quotes: [q("Our API docs went from a wiki to a real site in two days.", "Platform lead"), q("The TOC and copy buttons are the little things that matter.", "Developer advocate"), q("Versioning pattern saved us a rewrite.", "Engineering manager")],
      cta: { title: "Give your docs a home", body: "Clone Stackline, add Markdown, deploy. Developers will notice." },
      stack: ["Next.js 15", "React 19", "TypeScript", "Markdown/MDX"],
    },
  },
  {
    brand: "Foundry", vertical: "agency portfolio starter", palette: "charcoal", font: "editorial", radius: "6px",
    tagline: "A Next.js portfolio starter for design and development agencies with case-study routes.",
    site: {
      eyebrow: "Design & build studio", headline: "Work that <em>earns</em> attention.", lede: "Foundry is an agency site starter: an editorial homepage, a case-study route with a typed content model, a services page and a contact route with a server action.",
      pills: ["Case-study routes", "Server actions", "Editorial type"], appTitle: "Case studies", appCta: "New study", appKpis: [["Published", "14", "studies"], ["Draft", "3", "in review"], ["Enquiries", "26", "this month"]],
      benefits: [s("layers", "Case-study model", "A typed content model for client, brief, outcome and gallery."), s("file", "Services route", "Explain what you sell with a pattern that avoids the generic list."), s("users", "Team section", "Profiles that link to social and to the work they led."), s("chat", "Contact with server action", "A form that posts to a server action — no API route to write."), s("camera", "Image pipeline", "Optimised images with blur placeholders for galleries."), s("gear", "One theme file", "Retheme the whole site by editing tokens.")],
      how: [st("Add a case study", "One file per project with front-matter and Markdown."), st("Write the services page", "Edit the config; the layout adapts."), st("Deploy", "Static where possible, dynamic only for the form.")],
      plans: [plan("Freelancer", "$0", "", "For individuals.", ["All routes", "Case-study model", "Contact form", "Foundry credit"]), plan("Studio", "$39", "/month", "For teams.", ["Everything in Freelancer", "Team section", "No credit", "Priority support"], true), plan("Agency", "$99", "/month", "For larger agencies.", ["Everything in Studio", "Multi-language", "CMS adapter", "SLA"])],
      faq: [f("Can I use a CMS?", "Yes — the content model has adapters for common headless CMSs."), f("Where do form submissions go?", "The server action emails you by default; swap in your CRM."), f("Is it accessible?", "Semantic structure, focus states and reduced-motion support are built in."), f("Do I need to know React?", "Basic React is enough; content lives in Markdown and config.")],
      quotes: [q("Our case studies finally look as good as the work.", "Creative director"), q("The contact form took zero backend work.", "Developer"), q("We rethemed it for a second brand in an hour.", "Studio owner")],
      cta: { title: "Put the work first", body: "Clone Foundry, add your case studies, and launch a site that sells the studio." },
      stack: ["Next.js 15", "React 19", "TypeScript", "Server actions"],
    },
  },
  {
    brand: "Waypoint", vertical: "travel booking starter", palette: "ocean", font: "outfit", radius: "16px",
    tagline: "A Next.js starter for travel, tours or booking businesses with search and listing routes.",
    site: {
      eyebrow: "Tours, stays and experiences", headline: "Book the trip, <em>not the admin</em>.", lede: "Waypoint is a booking-site starter: a search hero, listing and detail routes with a typed data model, a date-aware enquiry flow and layouts that handle photography-heavy content.",
      pills: ["Listing & detail routes", "Search params", "Photo-first layouts"], appTitle: "Bookings", appCta: "New booking", appKpis: [["Enquiries", "312", "this month"], ["Conversion", "6.4%", "+0.8%"], ["Listings", "58", "live"]],
      benefits: [s("search", "Search that uses the URL", "Filters live in search params, so results are shareable and crawlable."), s("layers", "Listing model", "Typed listings with price, duration, availability and gallery."), s("cal", "Date-aware enquiry", "A date picker pattern and a server action for the enquiry."), s("pin", "Map slot", "A component slot for any map provider."), s("camera", "Galleries", "Optimised galleries with lightbox and blur placeholders."), s("globe", "Localisation-ready", "Currency and locale formatting utilities included.")],
      how: [st("Add listings", "JSON or Markdown, or connect a CMS."), st("Configure search", "Choose which fields filter and sort."), st("Wire the enquiry", "The server action posts to email or your booking system.")],
      plans: [plan("Explorer", "$0", "", "For small operators.", ["All routes", "Listing model", "Enquiry action", "Community support"]), plan("Operator", "$59", "/month", "For growing businesses.", ["Everything in Explorer", "CMS adapters", "Analytics", "Priority support"], true), plan("Group", "$179", "/month", "For multi-brand operators.", ["Everything in Operator", "Multi-site", "Payments adapter", "SLA"])],
      faq: [f("Does it take payments?", "An adapter pattern is included; connect the provider you use."), f("Can I connect my booking system?", "Yes — the enquiry action can post to any API."), f("Is it multilingual?", "Locale utilities are included; add translations as you need them."), f("How are images handled?", "Next.js image optimisation with blur placeholders.")],
      quotes: [q("Search params in the URL doubled our organic traffic.", "Tour operator"), q("We connected our booking engine in a day.", "Developer"), q("It finally looks like the photos deserve.", "Owner")],
      cta: { title: "Launch your booking site", body: "Waypoint gives you the routes, the model and the layouts. Add your trips." },
      stack: ["Next.js 15", "React 19", "TypeScript", "Server actions"],
    },
  },
  {
    brand: "Pulsefeed", vertical: "newsletter & publication starter", palette: "paper", font: "lora", radius: "8px",
    tagline: "A Next.js publication starter for newsletters, magazines and writer-led sites.",
    site: {
      eyebrow: "Write. Publish. Grow.", headline: "A home for your <em>writing</em>.", lede: "Pulsefeed is a publication starter with an editorial homepage, article routes from Markdown, an archive with tags, a subscribe form with a server action and RSS out of the box.",
      pills: ["Markdown articles", "RSS & sitemap", "Subscribe action"], appTitle: "Subscribers", appCta: "New post", appKpis: [["Subscribers", "8,420", "+310"], ["Open rate", "52%", "+2%"], ["Posts", "96", "published"]],
      benefits: [s("file", "Articles in Markdown", "Front-matter for title, date, tags and cover; routes generate themselves."), s("layers", "Editorial homepage", "Featured story, latest posts and a subscribe block."), s("mail", "Subscribe with a server action", "Posts to your email provider; no API route required."), s("globe", "RSS and sitemap", "Generated on build, always current."), s("search", "Tags and archive", "Browse by tag or by month."), s("sun", "Reading experience", "Typography tuned for long reads, dark mode included.")],
      how: [st("Write a post", "A Markdown file with front-matter."), st("Configure the publication", "Name, description, social links and provider in one file."), st("Publish", "Build and deploy; RSS and sitemap update automatically.")],
      plans: [plan("Writer", "$0", "", "For personal publications.", ["All routes", "RSS", "Subscribe action", "Pulsefeed credit"]), plan("Publication", "$19", "/month", "For growing newsletters.", ["Everything in Writer", "No credit", "Analytics", "Priority support"], true), plan("Media", "$79", "/month", "For multi-author sites.", ["Everything in Publication", "Author pages", "Paywall adapter", "SLA"])],
      faq: [f("Which email providers work?", "Any with an API; adapters for the common ones are included."), f("Can multiple authors write?", "Yes — author front-matter and author pages."), f("Is there a paywall?", "An adapter pattern is included for membership platforms."), f("Does it support MDX?", "Yes, for embeds and components inside posts.")],
      quotes: [q("Moved off a hosted platform and kept every subscriber.", "Newsletter writer"), q("Reading experience is the best I've shipped.", "Developer"), q("RSS just worked. Readers noticed.", "Editor")],
      cta: { title: "Start publishing", body: "Clone Pulsefeed, write your first post, and own your audience." },
      stack: ["Next.js 15", "React 19", "TypeScript", "Markdown/MDX"],
    },
  },
  {
    brand: "Vaultly", vertical: "fintech product starter", palette: "midnight", font: "manrope", radius: "14px",
    tagline: "A Next.js starter for fintech or financial-product marketing sites with compliance-friendly patterns.",
    site: {
      eyebrow: "Money, made clear", headline: "Finance that <em>explains itself</em>.", lede: "Vaultly is a fintech marketing starter: trust-first layouts, a security page pattern, transparent pricing tables, disclosure components and metadata tuned for regulated products.",
      pills: ["Security page pattern", "Disclosure components", "Dark & light"], appTitle: "Accounts", appCta: "Add account", appKpis: [["Balance", "$24,180", "+2.1%"], ["Yield", "4.2%", "APY"], ["Transfers", "18", "this month"]],
      benefits: [s("shield", "Security page", "A pattern for encryption, compliance and audit content."), s("file", "Disclosure components", "Footnotes, rate disclosures and regulatory copy with consistent styling."), s("chart", "Rates and calculators", "A calculator component wired to typed inputs."), s("lock", "Trust signals", "Badges, partner logos slot and a status link in the footer."), s("layers", "Product routes", "Cards, savings, transfers — a route per product."), s("gear", "Config-driven", "Rates, fees and copy in one typed file.")],
      how: [st("Set your products", "Define products, rates and fees in config."), st("Add disclosures", "Attach footnotes to any number on the page."), st("Deploy", "Static routes, with the calculator running on the client.")],
      plans: [plan("Launch", "$0", "", "For early-stage products.", ["All routes", "Disclosure components", "Calculator", "Vaultly credit"]), plan("Growth", "$79", "/month", "For live products.", ["Everything in Launch", "No credit", "A/B slots", "Priority support"], true), plan("Regulated", "$249", "/month", "For licensed institutions.", ["Everything in Growth", "Compliance review kit", "Multi-region", "SLA"])],
      faq: [f("Does this include legal copy?", "No — components are provided; your compliance team supplies the text."), f("Is dark mode included?", "Yes, with a toggle and system preference."), f("Can I embed a status page?", "A footer slot and a status component are included."), f("Is the calculator accurate?", "It is a typed component; you supply the formula.")],
      quotes: [q("The disclosure components saved a week of compliance back-and-forth.", "Product manager"), q("It looks trustworthy on a phone. That was the brief.", "Designer"), q("The calculator was the conversion feature.", "Growth lead")],
      cta: { title: "Build trust from the first screen", body: "Vaultly gives a financial product the patterns it needs. Add your numbers." },
      stack: ["Next.js 15", "React 19", "TypeScript", "CSS design tokens"],
    },
  },
  {
    brand: "Studioframe", vertical: "photography portfolio starter", palette: "charcoal", font: "editorial", radius: "2px",
    tagline: "A Next.js portfolio starter for photographers with gallery routes and optimised images.",
    site: {
      eyebrow: "Portfolio for photographers", headline: "Let the <em>frame</em> speak.", lede: "Studioframe is a photography portfolio starter: gallery routes from folders, an image pipeline with blur placeholders, a lightbox, and an about-and-contact flow that converts enquiries.",
      pills: ["Gallery from folders", "Lightbox", "Optimised images"], appTitle: "Galleries", appCta: "Upload", appKpis: [["Galleries", "12", "live"], ["Images", "1,840", "optimised"], ["Enquiries", "31", "this month"]],
      benefits: [s("camera", "Galleries from folders", "Drop images in a folder; a gallery route appears with a cover and a grid."), s("layers", "Masonry and full-bleed", "Two grid patterns and a full-bleed story layout."), s("bolt", "Fast images", "Responsive sizes, modern formats and blur placeholders."), s("play", "Lightbox", "Keyboard and swipe navigation, captions and download toggle."), s("mail", "Enquiry form", "A server action with date and location fields."), s("sun", "Dark by default", "Photography looks better on dark; light mode is one toggle away.")],
      how: [st("Add a gallery folder", "Images plus a small metadata file."), st("Choose a layout", "Masonry, grid or story per gallery."), st("Deploy", "Static galleries, dynamic only for enquiries.")],
      plans: [plan("Personal", "$0", "", "For personal portfolios.", ["All layouts", "Lightbox", "Enquiry action", "Studioframe credit"]), plan("Pro", "$29", "/month", "For working photographers.", ["Everything in Personal", "No credit", "Client galleries", "Priority support"], true), plan("Studio", "$89", "/month", "For studios.", ["Everything in Pro", "Multi-photographer", "Proofing adapter", "SLA"])],
      faq: [f("How many images can a gallery hold?", "Hundreds; images are optimised at build."), f("Can clients download?", "A per-gallery toggle; private galleries pattern included."), f("Where is the form sent?", "Email by default; connect a CRM with the adapter."), f("Does it support video?", "A video block is included for galleries.")],
      quotes: [q("Loads faster than any template I've paid for.", "Wedding photographer"), q("Galleries from folders is exactly how I think.", "Documentary photographer"), q("Enquiries doubled after the contact flow.", "Portrait studio")],
      cta: { title: "Show the work properly", body: "Clone Studioframe, add a folder of images, and publish a portfolio that loads instantly." },
      stack: ["Next.js 15", "React 19", "TypeScript", "Image optimisation"],
    },
  },
  {
    brand: "Launchkit", vertical: "product launch & waitlist starter", palette: "coral", font: "sora", radius: "18px",
    tagline: "A Next.js launch-page starter with a waitlist server action, referral pattern and social previews.",
    site: {
      eyebrow: "Launch pages that collect", headline: "Build the <em>waitlist</em> first.", lede: "Launchkit is a starter for pre-launch and launch pages: a hero with a working waitlist form, a referral pattern, feature reveals, and Open Graph images generated from the page.",
      pills: ["Waitlist server action", "OG image route", "Referral pattern"], appTitle: "Waitlist", appCta: "Export", appKpis: [["Signups", "4,218", "+412 today"], ["Referred", "38%", "of signups"], ["Position", "#1,204", "yours"]],
      benefits: [s("mail", "Waitlist that works", "A server action stores signups and sends a confirmation."), s("users", "Referral pattern", "Each signup gets a link; position improves with referrals."), s("camera", "Generated OG images", "A route that renders share images from the page copy."), s("layers", "Feature reveals", "Sections that unlock as you announce them."), s("chart", "Simple analytics", "Signup and referral counts on a private page."), s("gear", "One config", "Product name, copy and launch date in one typed file.")],
      how: [st("Set the launch", "Product name, date and copy in config."), st("Share the link", "OG images and referral links are ready."), st("Launch", "Flip a flag; the page becomes the product site.")],
      plans: [plan("Indie", "$0", "", "For side projects.", ["Waitlist action", "OG images", "Referral pattern", "Launchkit credit"]), plan("Startup", "$29", "/month", "For funded products.", ["Everything in Indie", "No credit", "Email provider adapters", "Priority support"], true), plan("Studio", "$99", "/month", "For agencies launching clients.", ["Everything in Startup", "Multi-project", "White label", "SLA"])],
      faq: [f("Where are signups stored?", "A database adapter is included; use any Postgres or a hosted DB."), f("Can I send confirmation emails?", "Yes, through the provider adapter of your choice."), f("Are the OG images dynamic?", "Yes — generated from copy per page."), f("Can I turn it into the real site?", "A launch flag switches the layout; keep the signups.")],
      quotes: [q("4,000 signups before we wrote a line of product code.", "Founder"), q("The referral pattern did the marketing for us.", "Growth"), q("OG images made every share look intentional.", "Designer")],
      cta: { title: "Start collecting", body: "Clone Launchkit, set a date, and share the link. The waitlist builds itself." },
      stack: ["Next.js 15", "React 19", "TypeScript", "Server actions"],
    },
  },
]

/* ------------------------------------------------------------------ */
/* Assemble                                                            */
/* ------------------------------------------------------------------ */

const CATEGORY = {
  website: ["website-templates", "Website Templates"],
  landing: ["landing-pages", "Landing Pages"],
  dashboard: ["admin-dashboards", "Admin Dashboards"],
  store: ["ecommerce-templates", "Ecommerce Templates"],
  nextjs: ["react-nextjs-templates", "React / Next.js Templates"],
}

// Personal / Commercial / Agency, per kind (matches the current catalog).
export const PRICING = {
  website: [39, 79, 149],
  landing: [29, 59, 119],
  dashboard: [59, 119, 229],
  store: [49, 99, 189],
  nextjs: [59, 119, 229],
}

const TYPE_LABEL = { website: "Website Template", landing: "Landing Page Template", dashboard: "Admin Dashboard Template", store: "Ecommerce Template", nextjs: "Next.js Starter" }

function slugify(s) {
  return s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
}
function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

let n = 0
function build(kind, entry) {
  n += 1
  const [category, categoryName] = CATEGORY[kind]
  const ACR = { saas: "SaaS", hr: "HR", crm: "CRM", sup: "SUP", it: "IT" }
  const clean = entry.vertical.replace(/'/g, "")
  const verticalTitle = entry.vertical.split(" ").map((w) => (w === "&" ? "&" : ACR[w] || w.split("-").map(cap).join("-"))).join(" ")
  // "… Dashboard Admin Dashboard Template" reads badly; drop the duplicate.
  const typeLabel = /dashboard$/i.test(clean) ? "Template" : /starter$/i.test(clean) ? "for Next.js" : TYPE_LABEL[kind]
  const name = `${entry.brand} — ${verticalTitle} ${typeLabel}`
  return {
    index: n,
    sku: `DS-ORG-${String(n).padStart(3, "0")}`,
    slug: slugify(`${entry.brand} ${clean} ${kind === "nextjs" ? "nextjs starter" : typeLabel}`),
    name,
    kind,
    category,
    categoryName,
    subcategory: verticalTitle,
    prices: PRICING[kind],
    ...entry,
    pitch: COPY[entry.brand]?.pitch ?? [],
    site: {
      ...entry.site,
      ...(COPY[entry.brand]?.site ?? {}),
      about: Array.isArray(entry.site.about)
        ? (COPY[entry.brand]?.site?.about ?? entry.site.about)
        : entry.site.about
          ? { ...entry.site.about, ...(COPY[entry.brand]?.site?.about ?? {}) }
          : entry.site.about,
    },
  }
}

export const PRODUCTS = [
  ...websites.map((e) => build("website", e)),
  ...landings.map((e) => build("landing", e)),
  ...dashboards.map((e) => build("dashboard", e)),
  ...stores.map((e) => build("store", e)),
  ...nextjs.map((e) => build("nextjs", e)),
]

if (PRODUCTS.length !== 50) throw new Error(`Expected 50 products, got ${PRODUCTS.length}`)
const slugs = new Set(PRODUCTS.map((p) => p.slug))
if (slugs.size !== 50) throw new Error("Duplicate slugs in catalog")
