import type { ReactNode } from "react"
import type { Icon as PhosphorIcon, IconProps } from "@phosphor-icons/react"
import {
  Atom,
  Briefcase,
  Browser,
  Browsers,
  Camera,
  ChartPieSlice,
  Code,
  Cube,
  DeviceMobile,
  Diamond,
  DotsNine,
  FileHtml,
  FileText,
  FilmSlate,
  Gift,
  GridFour,
  IdentificationCard,
  Image,
  Layout,
  Lightbulb,
  MusicNotes,
  NotionLogo,
  Package,
  PaintBrush,
  Palette,
  Presentation,
  Rocket,
  ShareNetwork,
  ShoppingCart,
  Table,
  TextAa,
  TextT,
} from "@phosphor-icons/react/dist/ssr"

export type IconComponent = (props: IconProps) => ReactNode

function createIcon(Icon: PhosphorIcon): IconComponent {
  const Wrapped: IconComponent & { displayName?: string } = (props) => <Icon weight="duotone" {...props} />
  Wrapped.displayName = "CategoryIcon"
  return Wrapped
}

const departmentIconMap: Record<string, IconComponent> = {
  "business-office": createIcon(Briefcase),
  "web-development": createIcon(Code),
  "design-resources": createIcon(Palette),
  "fonts-typography": createIcon(TextAa),
  media: createIcon(FilmSlate),
  "3d-and-print": createIcon(Cube),
  "product-bundles": createIcon(Package),
}

const subcategoryIconMap: Record<string, IconComponent> = {
  "templates-documents": createIcon(FileText),
  "design-branding": createIcon(PaintBrush),
  "code-templates": createIcon(Code),
  "graphics-icons": createIcon(GridFour),
  fonts: createIcon(TextT),
  audio: createIcon(MusicNotes),
  photography: createIcon(Camera),
  "3d-print": createIcon(Diamond),
  productivity: createIcon(Rocket),
  bundles: createIcon(Gift),
  "website-templates": createIcon(Browser),
  "ui-ux-kits": createIcon(Layout),
  "admin-dashboards": createIcon(ChartPieSlice),
  "landing-pages": createIcon(Browsers),
  "ecommerce-templates": createIcon(ShoppingCart),
  "react-nextjs-templates": createIcon(Atom),
  "html-templates": createIcon(FileHtml),
  "business-templates": createIcon(Briefcase),
  "presentation-templates": createIcon(Presentation),
  "resume-cv-templates": createIcon(IdentificationCard),
  "social-media-templates": createIcon(ShareNetwork),
  graphics: createIcon(Image),
  icons: createIcon(DotsNine),
  "fonts-typefaces": createIcon(TextAa),
  mockups: createIcon(DeviceMobile),
  "3d-assets": createIcon(Cube),
  "productivity-tools": createIcon(Lightbulb),
  "notion-workspace-templates": createIcon(NotionLogo),
  "excel-spreadsheet-templates": createIcon(Table),
  "digital-bundles": createIcon(Package),
}

const fallbackIcon = createIcon(Package)

export function getCategoryIcon(value: string | null | undefined): IconComponent {
  if (!value) return fallbackIcon
  const key = value.toLowerCase()
  return departmentIconMap[key] ?? subcategoryIconMap[key] ?? fallbackIcon
}

export function getDepartmentIcon(value: string | null | undefined): IconComponent {
  if (!value) return fallbackIcon
  return departmentIconMap[value.toLowerCase()] ?? fallbackIcon
}
