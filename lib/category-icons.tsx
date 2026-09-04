import type { ComponentProps, ReactNode } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Briefcase01Icon,
  SourceCodeIcon,
  PaletteIcon,
  TextFontIcon,
  Album01Icon,
  CubeIcon,
  Package02Icon,
  File01Icon,
  PaintBrush02Icon,
  CodeIcon,
  Grid2X2Icon,
  TypeIcon,
  MusicNote01Icon,
  Camera01Icon,
  Diamond01Icon,
  Rocket01Icon,
  GiftIcon,
  BrowserIcon,
  Layout01Icon,
  DashboardCircleIcon,
  WebDesign01Icon,
  ShoppingCart01Icon,
  ReactIcon,
  HtmlFiveIcon,
  Briefcase02Icon,
  Presentation01Icon,
  IdCardIcon,
  Share01Icon,
  Image01Icon,
  Grid3X3Icon,
  SmartPhone01Icon,
  BulbIcon,
  Notion01Icon,
  Table01Icon,
  Package01Icon,
  PackageIcon,
} from "@hugeicons/core-free-icons"

type IconProps = Omit<ComponentProps<typeof HugeiconsIcon>, "icon">
export type IconComponent = (props: IconProps) => ReactNode

function createIcon(icon: Parameters<typeof HugeiconsIcon>[0]["icon"]): IconComponent {
  const Icon: IconComponent & { displayName?: string } = (props) => <HugeiconsIcon icon={icon} {...props} />
  Icon.displayName = "CategoryIcon"
  return Icon
}

// Top-level department icons.
const departmentIconMap: Record<string, IconComponent> = {
  "business-office": createIcon(Briefcase01Icon),
  "web-development": createIcon(SourceCodeIcon),
  "design-resources": createIcon(PaletteIcon),
  "fonts-typography": createIcon(TextFontIcon),
  media: createIcon(Album01Icon),
  "3d-and-print": createIcon(CubeIcon),
  "product-bundles": createIcon(Package02Icon),
}

// Subcategory icons, kept distinct from one another and from their parent
// department icon so the mega menu and category grid stay scannable.
const subcategoryIconMap: Record<string, IconComponent> = {
  "templates-documents": createIcon(File01Icon),
  "design-branding": createIcon(PaintBrush02Icon),
  "code-templates": createIcon(CodeIcon),
  "graphics-icons": createIcon(Grid2X2Icon),
  fonts: createIcon(TypeIcon),
  audio: createIcon(MusicNote01Icon),
  photography: createIcon(Camera01Icon),
  "3d-print": createIcon(Diamond01Icon),
  productivity: createIcon(Rocket01Icon),
  bundles: createIcon(GiftIcon),
  "website-templates": createIcon(BrowserIcon),
  "ui-ux-kits": createIcon(Layout01Icon),
  "admin-dashboards": createIcon(DashboardCircleIcon),
  "landing-pages": createIcon(WebDesign01Icon),
  "ecommerce-templates": createIcon(ShoppingCart01Icon),
  "react-nextjs-templates": createIcon(ReactIcon),
  "html-templates": createIcon(HtmlFiveIcon),
  "business-templates": createIcon(Briefcase02Icon),
  "presentation-templates": createIcon(Presentation01Icon),
  "resume-cv-templates": createIcon(IdCardIcon),
  "social-media-templates": createIcon(Share01Icon),
  graphics: createIcon(Image01Icon),
  icons: createIcon(Grid3X3Icon),
  "fonts-typefaces": createIcon(TextFontIcon),
  mockups: createIcon(SmartPhone01Icon),
  "3d-assets": createIcon(CubeIcon),
  "productivity-tools": createIcon(BulbIcon),
  "notion-workspace-templates": createIcon(Notion01Icon),
  "excel-spreadsheet-templates": createIcon(Table01Icon),
  "digital-bundles": createIcon(Package01Icon),
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
