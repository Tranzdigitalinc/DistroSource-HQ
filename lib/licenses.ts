/**
 * Single source of truth for licence tier presentation.
 *
 * Tier *names* come from the database (`product_licenses.licenseType`), which
 * currently holds personal | commercial | agency (regular_license is legacy
 * and exists only on draft products). This module only decides how those
 * names read on the storefront — it never invents a tier the DB lacks.
 */

export interface LicenseTierCopy {
  label: string
  /** One line, plain language, no rights language a customer could misread. */
  summary: string
  sortOrder: number
}

export const LICENSE_TIERS: Record<string, LicenseTierCopy> = {
  personal: {
    label: "Personal",
    summary: "For your own non-commercial projects.",
    sortOrder: 0,
  },
  commercial: {
    label: "Commercial",
    summary: "For one commercial project or one client project.",
    sortOrder: 1,
  },
  agency: {
    label: "Agency",
    summary: "For multiple client projects within one company.",
    sortOrder: 2,
  },
  regular_license: {
    label: "Regular",
    summary: "Standard single-use licence.",
    sortOrder: 3,
  },
}

export function licenseLabel(licenseType: string): string {
  return (
    LICENSE_TIERS[licenseType]?.label ??
    licenseType
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
  )
}

/** Prefer the product's own description when the catalog provides one. */
export function licenseSummary(licenseType: string, productDescription?: string | null): string {
  return productDescription?.trim() || LICENSE_TIERS[licenseType]?.summary || ""
}

export function sortLicenses<T extends { licenseType: string; price: string | number }>(licenses: T[]): T[] {
  return [...licenses].sort((a, b) => {
    const sa = LICENSE_TIERS[a.licenseType]?.sortOrder ?? 99
    const sb = LICENSE_TIERS[b.licenseType]?.sortOrder ?? 99
    return sa - sb || Number(a.price) - Number(b.price)
  })
}
