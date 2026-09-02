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
  type LucideIcon,
} from "lucide-react"

// Explicit slug -> icon mapping for DistroSource's digital-product categories.
export const categoryIconMap: Record<string, LucideIcon> = {
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

export function getCategoryIcon(value: string | null | undefined): LucideIcon {
  if (!value) return Package
  const key = value.toLowerCase()
  return categoryIconMap[key] ?? Package
}
