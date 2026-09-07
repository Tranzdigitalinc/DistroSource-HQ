import type { ReactNode } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Atom01Icon,
  Briefcase01Icon,
  BrowserIcon,
  Camera01Icon,
  ColorsIcon,
  CubeIcon,
  Diamond01Icon,
  File02Icon,
  ClapperboardIcon,
  GiftIcon,
  GridIcon,
  GridViewIcon,
  Idea01Icon,
  IdentityCardIcon,
  Image01Icon,
  Layout01Icon,
  MusicNote03Icon,
  Notion01Icon,
  PackageIcon,
  PaintBrush01Icon,
  PieChartIcon,
  PresentationBarChart01Icon,
  Rocket01Icon,
  Share08Icon,
  ShoppingCart01Icon,
  SmartPhone01Icon,
  SourceCodeIcon,
  Table01Icon,
  TextFontIcon,
  TextIcon,
  WebDesign01Icon,
} from "@hugeicons/core-free-icons"
import type { IconProps, IconSvg } from "@/lib/storefront-icons"

export type IconComponent = (props: IconProps) => ReactNode

/** Department and subcategory glyphs: the same Hugeicons stroke set as the storefront. */
function createIcon(icon: IconSvg): IconComponent {
  const Wrapped: IconComponent & { displayName?: string } = ({ size = 20, strokeWidth = 1.5, weight, ...props }) => {
    void weight // accepted for API compatibility; the free set has one weight
    return <HugeiconsIcon icon={icon as never} size={size} strokeWidth={Number(strokeWidth)} {...props} />
  }
  Wrapped.displayName = "CategoryIcon"
  return Wrapped
}

const departmentIconMap: Record<string, IconComponent> = {
  "business-office": createIcon(Briefcase01Icon),
  "web-development": createIcon(SourceCodeIcon),
  "design-resources": createIcon(ColorsIcon),
  "fonts-typography": createIcon(TextFontIcon),
  media: createIcon(ClapperboardIcon),
  "3d-and-print": createIcon(CubeIcon),
  "product-bundles": createIcon(PackageIcon),
}

const subcategoryIconMap: Record<string, IconComponent> = {
  "templates-documents": createIcon(File02Icon),
  "design-branding": createIcon(PaintBrush01Icon),
  "code-templates": createIcon(SourceCodeIcon),
  "graphics-icons": createIcon(GridViewIcon),
  fonts: createIcon(TextIcon),
  audio: createIcon(MusicNote03Icon),
  photography: createIcon(Camera01Icon),
  "3d-print": createIcon(Diamond01Icon),
  productivity: createIcon(Rocket01Icon),
  bundles: createIcon(GiftIcon),
  "website-templates": createIcon(BrowserIcon),
  "ui-ux-kits": createIcon(Layout01Icon),
  "admin-dashboards": createIcon(PieChartIcon),
  "landing-pages": createIcon(WebDesign01Icon),
  "ecommerce-templates": createIcon(ShoppingCart01Icon),
  "react-nextjs-templates": createIcon(Atom01Icon),
  "html-templates": createIcon(BrowserIcon),
  "business-templates": createIcon(Briefcase01Icon),
  "presentation-templates": createIcon(PresentationBarChart01Icon),
  "resume-cv-templates": createIcon(IdentityCardIcon),
  "social-media-templates": createIcon(Share08Icon),
  graphics: createIcon(Image01Icon),
  icons: createIcon(GridIcon),
  "fonts-typefaces": createIcon(TextFontIcon),
  mockups: createIcon(SmartPhone01Icon),
  "3d-assets": createIcon(CubeIcon),
  "productivity-tools": createIcon(Idea01Icon),
  "notion-workspace-templates": createIcon(Notion01Icon),
  "excel-spreadsheet-templates": createIcon(Table01Icon),
  "digital-bundles": createIcon(PackageIcon),
}

const fallbackIcon = createIcon(PackageIcon)

export function getCategoryIcon(value: string | null | undefined): IconComponent {
  if (!value) return fallbackIcon
  const key = value.toLowerCase()
  return departmentIconMap[key] ?? subcategoryIconMap[key] ?? fallbackIcon
}

export function getDepartmentIcon(value: string | null | undefined): IconComponent {
  if (!value) return fallbackIcon
  return departmentIconMap[value.toLowerCase()] ?? fallbackIcon
}
