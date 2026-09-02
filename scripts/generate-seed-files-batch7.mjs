import fs from "node:fs"
import path from "node:path"
import { writePdf } from "./make-pdf.mjs"

const ROOT = "/vercel/share/v0-project/.v0/seed/files"

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true })
}

function write(p, content) {
  ensureDir(path.dirname(p))
  fs.writeFileSync(p, content)
}

// ---------- Business Documents ----------
writePdf(`${ROOT}/invoice-proposal-pack/Invoice-Template.pdf`, [
  {
    title: "Professional Invoice Template",
    body: [
      "Invoice #: 0001                Date: 01/15/2026",
      "Bill To: Client Name, Client Company, City, State",
      "Description: Consulting Services — Qty 1 — Rate $1,500.00 — Amount $1,500.00",
      "Description: Project Management — Qty 10 hrs — Rate $85.00 — Amount $850.00",
      "Subtotal: $2,350.00     Tax (0%): $0.00     Total Due: $2,350.00",
      "Payment Terms: Due within 15 days. Thank you for your business.",
    ],
  },
])
writePdf(`${ROOT}/invoice-proposal-pack/Business-Proposal-Template.pdf`, [
  {
    title: "Business Proposal Template",
    body: [
      "Prepared For: Client Name          Prepared By: Your Company",
      "Executive Summary: This proposal outlines the scope, timeline, and investment for the requested engagement.",
      "Scope of Work: Discovery, strategy, execution, and reporting phases delivered over 6 weeks.",
      "Timeline: Weeks 1-2 Discovery, Weeks 3-5 Execution, Week 6 Delivery & Handoff.",
      "Investment: $4,500 fixed fee, 50% due at signing, 50% due at completion.",
      "Next Steps: Sign and return this proposal to begin onboarding.",
    ],
  },
])
write(
  `${ROOT}/invoice-proposal-pack/README.md`,
  `# Invoice & Business Proposal Template Pack\n\nIncludes an editable invoice template and a business proposal template. Open the PDFs to view layout and copy the structure into Word, Google Docs, or your invoicing tool of choice.\n`,
)

writePdf(`${ROOT}/contract-nda-bundle/Freelance-Service-Contract.pdf`, [
  {
    title: "Freelance Service Contract",
    body: [
      "This Agreement is entered into between [Service Provider] and [Client] effective as of the date signed below.",
      "1. Services: Provider agrees to perform the services described in the attached Statement of Work.",
      "2. Payment: Client agrees to pay Provider according to the agreed rate and schedule.",
      "3. Term & Termination: Either party may terminate this agreement with 14 days written notice.",
      "4. Ownership: Upon full payment, all deliverables become the property of the Client.",
      "5. Confidentiality: Both parties agree to keep proprietary information confidential.",
      "Signed: _______________________          Date: _______________",
    ],
  },
])
writePdf(`${ROOT}/contract-nda-bundle/Mutual-NDA-Template.pdf`, [
  {
    title: "Mutual Non-Disclosure Agreement",
    body: [
      "This Mutual Non-Disclosure Agreement is made between the two undersigned parties.",
      "1. Purpose: The parties wish to explore a potential business relationship and may disclose confidential information.",
      "2. Confidential Information: Includes business plans, financials, client lists, and proprietary processes.",
      "3. Obligations: Each party agrees not to disclose the other's confidential information to third parties.",
      "4. Term: This agreement remains in effect for 2 years from the effective date.",
      "Signed: _______________________          Date: _______________",
    ],
  },
])
write(
  `${ROOT}/contract-nda-bundle/README.md`,
  `# Contract & NDA Template Bundle\n\nIncludes a freelance service contract and a mutual NDA template. Have a licensed attorney review before using for a specific engagement.\n`,
)

// ---------- Creator Resources ----------
write(
  `${ROOT}/youtube-branding-kit/channel-banner.svg`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2560 1440"><rect width="2560" height="1440" fill="#0f0f0f"/><rect x="0" y="560" width="2560" height="320" fill="#ff3b3b"/><text x="1280" y="770" font-size="140" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" fill="#ffffff" font-weight="bold">YOUR CHANNEL NAME</text></svg>`,
)
write(
  `${ROOT}/youtube-branding-kit/thumbnail-template-01.svg`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720"><rect width="1280" height="720" fill="#111827"/><rect x="0" y="500" width="1280" height="220" fill="#facc15"/><text x="60" y="640" font-size="72" font-family="Arial, Helvetica, sans-serif" fill="#111827" font-weight="bold">EPISODE TITLE HERE</text></svg>`,
)
write(
  `${ROOT}/youtube-branding-kit/thumbnail-template-02.svg`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720"><rect width="1280" height="720" fill="#1d4ed8"/><circle cx="1050" cy="180" r="140" fill="#ffffff" opacity="0.15"/><text x="60" y="380" font-size="80" font-family="Arial, Helvetica, sans-serif" fill="#ffffff" font-weight="bold">NEW VIDEO</text></svg>`,
)
write(
  `${ROOT}/youtube-branding-kit/README.md`,
  `# YouTube Channel Branding Kit\n\nIncludes a channel banner (2560x1440) and two thumbnail templates (1280x720) as editable SVGs. Open in Figma, Illustrator, or Photopea and swap in your own title text and photos.\n`,
)

write(
  `${ROOT}/podcast-launch-kit/podcast-cover-art.svg`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3000 3000"><rect width="3000" height="3000" fill="#111827"/><circle cx="1500" cy="1300" r="520" fill="#f97316"/><text x="1500" y="2100" font-size="220" text-anchor="middle" font-family="Georgia, serif" fill="#ffffff" font-weight="bold">THE SHOW</text></svg>`,
)
writePdf(`${ROOT}/podcast-launch-kit/Episode-Planner.pdf`, [
  {
    title: "Podcast Episode Planner",
    body: [
      "Episode Title: ___________________________          Episode #: _______",
      "Guest (if any): ___________________________",
      "Hook / Cold Open: What is the one sentence that makes someone press play?",
      "Segment 1 — Introduction (0:00-3:00)",
      "Segment 2 — Main Discussion (3:00-25:00): key talking points and questions.",
      "Segment 3 — Wrap Up & Call to Action (25:00-30:00)",
      "Show Notes Draft: One paragraph summary for the episode description.",
    ],
  },
])
write(
  `${ROOT}/podcast-launch-kit/README.md`,
  `# Podcast Launch Kit\n\nIncludes a 3000x3000 cover art template (meets Apple Podcasts/Spotify size requirements) and a printable episode planner PDF for scripting every episode.\n`,
)

// ---------- Freelancer Resources ----------
writePdf(`${ROOT}/freelancer-onboarding-kit/Client-Onboarding-Questionnaire.pdf`, [
  {
    title: "Client Onboarding Questionnaire",
    body: [
      "1. What is the primary goal of this project?",
      "2. Who is your target audience?",
      "3. What is your timeline and any hard deadlines?",
      "4. What is your approved budget range for this project?",
      "5. Who are your top 3 competitors, and what do you like/dislike about them?",
      "6. What does success look like 90 days after launch?",
      "7. Are there brand guidelines, logos, or assets we should use?",
    ],
  },
])
writePdf(`${ROOT}/freelancer-onboarding-kit/Welcome-Packet.pdf`, [
  {
    title: "Client Welcome Packet",
    body: [
      "Welcome! Here's what to expect while we work together.",
      "Communication: We respond within 1 business day via email.",
      "Process: Discovery -> Draft -> Revisions (2 rounds included) -> Final Delivery.",
      "Payment: 50% deposit to begin, balance due at delivery.",
      "Files: Final files delivered via secure download link within 3 business days of final payment.",
    ],
  },
])
write(
  `${ROOT}/freelancer-onboarding-kit/README.md`,
  `# Freelancer Client Onboarding Kit\n\nIncludes a client onboarding questionnaire and a welcome packet template PDF. Use these to standardize your intake process for every new project.\n`,
)

write(
  `${ROOT}/freelance-rate-calculator/Freelance-Rate-Calculator.csv`,
  `Expense Category,Monthly Cost
Rent/Mortgage (business share),400
Software & Tools,120
Insurance,150
Taxes Set-Aside (30%),0
Target Take-Home Pay,4000
Billable Hours Per Month,120
,
Calculation,Value
Total Monthly Costs,4670
Required Hourly Rate,39
Recommended Rate (with buffer),52
`,
)
write(
  `${ROOT}/freelance-rate-calculator/README.md`,
  `# Freelance Rate & Proposal Calculator\n\nOpen Freelance-Rate-Calculator.csv in Excel or Google Sheets. Fill in your own expenses, target income, and billable hours to calculate the hourly rate you need to charge.\n`,
)

// ---------- Kids & Family ----------
writePdf(`${ROOT}/kids-chore-chart/Weekly-Chore-Chart.pdf`, [
  {
    title: "Weekly Chore Chart & Reward System",
    body: [
      "Child's Name: _______________          Week of: _______________",
      "Chore: Make Bed          Mon Tue Wed Thu Fri Sat Sun          Points: 1",
      "Chore: Feed Pet          Mon Tue Wed Thu Fri Sat Sun          Points: 1",
      "Chore: Tidy Room         Mon Tue Wed Thu Fri Sat Sun          Points: 2",
      "Chore: Homework Done     Mon Tue Wed Thu Fri Sat Sun          Points: 2",
      "Reward Levels: 10 pts = Choose a movie night. 20 pts = Small toy. 30 pts = Family outing.",
    ],
  },
])
write(
  `${ROOT}/kids-chore-chart/README.md`,
  `# Kids Chore Chart & Reward System\n\nA printable weekly chore chart with a point-based reward system. Print one per child and stick it on the fridge.\n`,
)

write(
  `${ROOT}/family-meal-planner/Weekly-Meal-Planner.csv`,
  `Day,Breakfast,Lunch,Dinner
Monday,Oatmeal,Turkey Sandwich,Spaghetti & Meatballs
Tuesday,Yogurt & Fruit,Chicken Salad,Tacos
Wednesday,Scrambled Eggs,Leftover Tacos,Stir Fry
Thursday,Pancakes,Grilled Cheese,Baked Chicken & Veggies
Friday,Smoothie,Soup & Salad,Homemade Pizza
Saturday,Waffles,Sandwiches,Family BBQ
Sunday,French Toast,Leftovers,Roast & Potatoes
`,
)
write(
  `${ROOT}/family-meal-planner/Grocery-List-Template.csv`,
  `Category,Item,Quantity
Produce,Bananas,1 bunch
Produce,Spinach,1 bag
Dairy,Milk,1 gallon
Dairy,Eggs,1 dozen
Meat,Chicken Breast,2 lbs
Pantry,Pasta,2 boxes
`,
)
write(
  `${ROOT}/family-meal-planner/README.md`,
  `# Family Meal Planner & Grocery List\n\nIncludes a weekly meal planner and a matching grocery list template, both as editable CSV files for Excel or Google Sheets.\n`,
)

// ---------- Marketing Resources ----------
write(
  `${ROOT}/social-media-content-calendar/Social-Media-Content-Calendar.csv`,
  `Date,Platform,Content Type,Caption Idea,Status
Mon,Instagram,Reel,Behind-the-scenes at the studio,Draft
Tue,LinkedIn,Article,Industry trend recap,Scheduled
Wed,Instagram,Carousel,3 tips for our audience,Draft
Thu,TikTok,Short Video,Quick product demo,Idea
Fri,Instagram,Story,Weekly recap poll,Idea
Sat,Facebook,Photo,Customer spotlight,Idea
Sun,Email,Newsletter,Weekly roundup,Scheduled
`,
)
write(
  `${ROOT}/social-media-content-calendar/README.md`,
  `# Social Media Content Calendar Template\n\nOpen the CSV in Excel or Google Sheets. Duplicate the week's rows to build out a full month or quarter of content, and use the Status column to track your pipeline.\n`,
)

write(
  `${ROOT}/email-marketing-swipe-file/Welcome-Email-Swipe.md`,
  `# Welcome Email Swipe\n\n**Subject:** Welcome to [Brand] — here's where to start\n\nHi [First Name],\n\nWe're glad you're here. Here are 3 things to check out first:\n\n1. [Link to best resource]\n2. [Link to popular product]\n3. [Link to community/support]\n\nReply to this email any time — a real person reads every message.\n\n[Your Name]\n`,
)
write(
  `${ROOT}/email-marketing-swipe-file/Cart-Abandonment-Swipe.md`,
  `# Cart Abandonment Email Swipe\n\n**Subject:** You left something behind\n\nHi [First Name],\n\nYour cart is saved and ready whenever you are. Here's what's waiting:\n\n[Product Name] — [Price]\n\nComplete your order in the next 24 hours and use code SAVE10 for 10% off.\n\n[CTA Button: Complete My Order]\n`,
)
write(
  `${ROOT}/email-marketing-swipe-file/Product-Launch-Swipe.md`,
  `# Product Launch Email Swipe\n\n**Subject:** It's here: [Product Name]\n\nHi [First Name],\n\nAfter months of work, [Product Name] is officially live.\n\nWhat it does: [one sentence]\nWho it's for: [one sentence]\nLaunch pricing ends [date].\n\n[CTA Button: Get Early Access Pricing]\n`,
)
write(
  `${ROOT}/email-marketing-swipe-file/README.md`,
  `# Email Marketing Swipe File Pack\n\nThree ready-to-adapt email templates (welcome, cart abandonment, product launch) as editable Markdown files. Copy the subject and body into your email platform and fill in the brackets.\n`,
)

console.log("Batch 7 seed content files generated.")
