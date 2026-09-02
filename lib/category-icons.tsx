import {
  FileText,
  Palette,
  Code2,
  Shapes,
  Type,
  Music,
  Camera,
  Box,
  NotebookPen,
  Package,
  type IconComponent,
} from "@/lib/storefront-icons"

// Explicit slug -> icon mapping for DistroSource's digital-product categories.
export const categoryIconMap: Record<string, IconComponent> = {
  "templates-documents": FileText,
  "design-branding": Palette,
  "code-templates": Code2,
  "graphics-icons": Shapes,
  fonts: Type,
  audio: Music,
  photography: Camera,
  "3d-print": Box,
  productivity: NotebookPen,
  bundles: Package,
}

export function getCategoryIcon(value: string | null | undefined): IconComponent {
  if (!value) return Package
  const key = value.toLowerCase()
  return categoryIconMap[key] ?? Package
}
