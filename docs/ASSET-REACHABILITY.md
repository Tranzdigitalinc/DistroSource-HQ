# Asset Reachability Audit

Generated: 2026-09-04T04:20:52.009Z

Read-only. Confirms whether each `product_files` row points at an object that
actually exists in the Blob store.

## Downloadable files

| Check | Count |
|---|---|
| product_files rows | 345 |
| Object present in Blob | 300 |
| **Object MISSING** | **45** |
| Present but < 1 KB (suspect) | 10 |
| Present, size not recorded in DB | 0 |
| Recorded size disagrees with Blob | 0 |

### Missing objects — these products cannot deliver

| product | slug | status | fileName |
|---|---|---|---|
| 1 | `annual-report-template` | published | annual-report-template.zip |
| 2 | `business-launch-kit` | published | business-launch-kit.zip |
| 3 | `pitch-deck-template` | published | pitch-deck-template.zip |
| 4 | `invoice-proposal-pack` | published | invoice-proposal-pack.zip |
| 5 | `contract-nda-bundle` | published | contract-nda-bundle.zip |
| 6 | `executive-resume` | published | executive-resume.zip |
| 7 | `resume-pack` | published | resume-pack.zip |
| 8 | `freelancer-onboarding-kit` | published | freelancer-onboarding-kit.zip |
| 9 | `freelance-rate-calculator` | published | freelance-rate-calculator.zip |
| 10 | `branding-bakery` | published | branding-bakery.zip |
| 11 | `branding-startup` | published | branding-startup.zip |
| 12 | `freelance-agency-kit` | published | freelance-agency-kit.zip |
| 13 | `youtube-branding-kit` | published | youtube-branding-kit.zip |
| 14 | `podcast-launch-kit` | published | podcast-launch-kit.zip |
| 15 | `nextjs-saas-boilerplate` | published | nextjs-saas-boilerplate.zip |
| 16 | `react-admin-dashboard` | published | react-admin-dashboard.zip |
| 17 | `uiux-kit` | published | uiux-kit.zip |
| 18 | `portfolio-site` | published | portfolio-site.zip |
| 19 | `saas-landing` | published | saas-landing.zip |
| 20 | `real-estate-pack` | published | real-estate-pack.zip |
| 21 | `fashion-store` | published | fashion-store.zip |
| 22 | `line-icons-pack` | published | line-icons-pack.zip |
| 23 | `gradient-shapes` | published | gradient-shapes.zip |
| 24 | `nature-illustrations` | published | nature-illustrations.zip |
| 25 | `svg-craft-files` | published | svg-craft-files.zip |
| 26 | `apparel-mockup` | published | apparel-mockup.zip |
| 27 | `iphone-mockup` | published | iphone-mockup.zip |
| 28 | `instagram-pack` | published | instagram-pack.zip |
| 29 | `tiktok-pack` | published | tiktok-pack.zip |
| 30 | `font-modern-sans` | published | font-modern-sans.zip |
| 31 | `font-script-duo` | published | font-script-duo.zip |
| 32 | `audio-ambient-pack` | published | audio-ambient-pack.zip |
| 33 | `lightroom-presets` | published | lightroom-presets.zip |
| 34 | `stl-desk-organizer` | published | stl-desk-organizer.zip |
| 35 | `life-organizer-notion` | published | life-organizer-notion.zip |
| 36 | `startup-pm-notion` | published | startup-pm-notion.zip |
| 37 | `digital-life-planner` | published | digital-life-planner.zip |
| 38 | `personal-budget-planner` | published | personal-budget-planner.zip |
| 39 | `classroom-worksheets` | published | classroom-worksheets.zip |
| 40 | `kids-chore-chart` | published | kids-chore-chart.zip |
| 41 | `family-meal-planner` | published | family-meal-planner.zip |
| 42 | `social-media-content-calendar` | published | social-media-content-calendar.zip |
| 43 | `email-marketing-swipe-file` | published | email-marketing-swipe-file.zip |
| 44 | `fitness-studio-pack` | published | fitness-studio-pack.zip |
| 45 | `wedding-invitation-suite` | published | wedding-invitation-suite.zip |

### Present but suspiciously small (< 1 KB)

| product | slug | fileName | bytes |
|---|---|---|---|
| 187 | `cashline-personal-budget-spreadsheet` | cashline-personal-budget-spreadsheet.zip | 975 |
| 188 | `runwaymark-startup-financial-model` | runwaymark-startup-financial-model.zip | 1006 |
| 189 | `trackframe-project-timeline-spreadsheet` | trackframe-project-timeline-spreadsheet.zip | 997 |
| 190 | `stockcount-inventory-tracking-spreadsheet` | stockcount-inventory-tracking-spreadsheet.zip | 1000 |
| 191 | `leadframe-sales-pipeline-spreadsheet` | leadframe-sales-pipeline-spreadsheet.zip | 989 |
| 470 | `everspire-rental-property-tracker-spreadsheet-template` | everspire-rental-property-tracker-spreadsheet-template.zip | 929 |
| 471 | `foxspire-freelance-invoice-expense-tracker-spreadsheet-template` | foxspire-freelance-invoice-expense-tracker-spreadsheet-template.zip | 974 |
| 472 | `glenspire-wedding-budget-planner-spreadsheet-template` | glenspire-wedding-budget-planner-spreadsheet-template.zip | 925 |
| 473 | `hearthspire-content-calendar-spreadsheet-spreadsheet-template` | hearthspire-content-calendar-spreadsheet-spreadsheet-template.zip | 955 |
| 474 | `ivoryspire-okr-kpi-tracker-spreadsheet-spreadsheet-template` | ivoryspire-okr-kpi-tracker-spreadsheet-spreadsheet-template.zip | 956 |

## Gallery coverage (published products)

| Images | Products |
|---|---|
| 0 | 0 |
| 1 | 347 |
| 2–3 | 0 |
| 4+ | 0 |

Target is 4–5 images per product. **0 of 347** published products meet it.
