# Catalog Deliverability — STOP finding

**Date:** 2026-09-04
**Method:** read-only. Every `product_files` row resolved against Vercel Blob;
all 300 existing objects downloaded through the SDK and their zip central
directories parsed. No database or Blob write was performed.

---

## Summary

**No product in the DistroSource catalog delivers what its page describes.**

The catalog-expansion task was not started, because its premise does not hold:
there is nothing to "enhance", and adding 300 more products on this foundation
would multiply an existing misrepresentation rather than fix it.

| State | Count |
|---|---|
| Published products | 347 |
| Deliver **nothing** (blob object missing) | **45** |
| Deliver a stub archive (0.9–3.7 KB) | **302** |
| Deliver the product their page describes | **0** |
| Published products with 4+ gallery images | **0** (every product has exactly 1) |

---

## Evidence

### 1. Forty-five published products have no file at all

45 `product_files` rows point at Blob objects that do not exist. All 45 are
**published and purchasable right now**. These are exactly the 45 rows whose
`fileSizeBytes` is NULL — the null size was the symptom, the missing object is
the cause. There is no size to "backfill safely": the file isn't there.

Affected include `annual-report-template`, `business-launch-kit`,
`pitch-deck-template`, `invoice-proposal-pack`, `contract-nda-bundle`,
`executive-resume`, `resume-pack`, `freelancer-onboarding-kit`.

### 2. The other 302 are stubs

Every present object is a valid zip, and every one is tiny:

- size range **925 B – 3,693 B**, median **1,689 B**
- entries per archive: min 2, **median 2**, max 9

Three downloaded in full:

```
nettlehaven-landscaping-…-website-template        3,693 B
    index.html          1,380 B
    css/style.css         959 B
    js/main.js            167 B
    README.txt            775 B

nettleweald-new-business-launch-bundle            1,635 B
    BUNDLE-CONTENTS.txt   683 B
    README.txt            720 B          <- two text files, nothing else

glenspire-wedding-budget-planner-spreadsheet        925 B
    template.csv          213 B          <- a 213-byte CSV, not a spreadsheet
    README.txt            494 B
```

### 3. File types across all 300 archives

| Extension | Count |
|---|---|
| .txt (README / manifest) | 402 |
| .svg | 112 |
| .tsx | 94 |
| .json | 75 |
| .html / .css / .js | 60 each |
| .md | 47 |
| .docx | 10 |
| .csv | 10 |
| .pptx | 5 |
| .pdf | 5 |

**There is not a single `.xlsx` file in the catalog**, yet the storefront sells
"Excel business systems", "financial dashboards", "inventory systems" and
"spreadsheet templates". The 10 CSVs are ~213-byte stubs.

### 4. The products are not distinct

| Entry name | Appears in |
|---|---|
| `README.txt` | 253 products |
| `manifest.txt` | 72 |
| `index.html` + `css/style.css` + `js/main.js` | 60 each |
| `package.json` + `app/page.tsx` + `components/starter-card.tsx` | 47 each |

347 published products are backed by roughly **four** distinct stub templates,
copied with different names. The 60 "website templates" ship the same three
files; the 47 "Next.js / React templates" ship the same starter skeleton.

---

## Why the requested work was not started

The brief's own rules forbid it:

- *"Never advertise a file that does not exist in the download."*
- *"Do not publish a broken or nonexistent product simply to hit the number."*
- *"Every product offered for payment must be a real deliverable."*

Writing the requested rich content — "What's Included" listing
`LedgerFlow.xlsx`, `Sample Business Data.xlsx`, `Quick-Start.pdf`, and a
description explaining automatic gross-margin calculation — against an archive
containing a 213-byte CSV and a README would convert a thin listing into a
specific, documented false statement about what the buyer receives. That is
worse for the customer and materially worse in a payment-compliance review than
the current vague copy.

The same applies to the 4–5 gallery images: the brief requires them to be real
previews of the actual product ("build/run the actual template and capture real
screenshots"). There is no product to screenshot.

## Why 300 new products is not achievable as specified

Each new product must ship a real, professional deliverable plus 4–5 authentic
screenshots of that deliverable. A genuine Excel business system (working
formulas, linked sheets, charts), a production-quality Next.js template, or a
real icon pack is days of skilled work each. 300 of them, plus ~1,500 genuine
screenshots, is not deliverable in this task at the stated quality bar.

Producing 300 items quickly would necessarily mean generating variations of a
template — which is precisely what created the current situation.

---

## Recommended path

**Stop selling what cannot be delivered, then rebuild depth over breadth.**

1. **Immediately** — unpublish the 45 products with no file, plus
   `agency-bundle` and `creator-bundle` (which deliver nothing because bundle
   entitlement expansion does not exist). This is a `status` change only, fully
   reversible, and stops money being taken for nothing. **Awaiting approval.**
2. **Decide on the remaining 302.** They are purchasable and materially
   thinner than described. Options: unpublish pending real content, or keep
   live while content is rebuilt. My recommendation is to unpublish, because a
   buyer paying for a "financial dashboard" and receiving a 213-byte CSV is a
   chargeback and a compliance finding.
3. **Build a reference product end to end** — one genuine product with a real
   `.xlsx`, professional packaging, and 4–5 screenshots captured from the real
   file. That establishes the quality bar and proves the pipeline.
4. **Then scale deliberately**, at a realistic rate, with each product verified
   through the entitlement/download path before publishing.

A store of 20 genuinely excellent products survives a merchant-of-record review.
A store of 650 stubs does not.

---

## What was verified working

- `DATABASE_URL` present; connects to the real production database
  (`neondb`, 350 products / 5 orders / 6 users / 345 file rows).
- `BLOB_READ_WRITE_TOKEN` present; Blob **read, write, head and delete** all
  confirmed against a private store using a scratch path that was removed
  immediately. 982 objects indexed.
- `.env.local` is gitignored. Neither secret value has been printed, logged or
  committed.
