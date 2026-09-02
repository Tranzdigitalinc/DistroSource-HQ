"use client"

import type { ComponentProps, ReactNode } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  CheckIcon as HugeCheckIcon,
  Copy01Icon,
  Download01Icon,
  GiftIcon,
  HeartIcon,
  Layers01Icon,
  LockKeyIcon,
  Mail01Icon,
  Menu01Icon,
  Moon02Icon,
  PackageIcon,
  Remove01Icon,
  Search01Icon,
  Settings01Icon,
  Share01Icon,
  ShoppingCart01Icon,
  SparklesIcon,
  StarIcon,
  Sun03Icon,
  UserIcon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons"

type IconProps = Omit<ComponentProps<typeof HugeiconsIcon>, "icon">

export type IconComponent = (props: IconProps) => ReactNode

function createIcon(icon: Parameters<typeof HugeiconsIcon>[0]["icon"]): IconComponent {
  return (props) => <HugeiconsIcon icon={icon} {...props} />
}

export const ArrowRight = createIcon(ArrowRight01Icon)
export const ArrowUp = createIcon(ArrowUp01Icon)
export const ArrowUpRight = createIcon(ArrowUp01Icon)
export const ChevronDown = createIcon(ArrowUp01Icon)
export const ChevronRight = createIcon(ArrowRight01Icon)
export const ChevronLeft = createIcon(ArrowRight01Icon)
export const ArrowDown = createIcon(ArrowRight01Icon)
export const Check = createIcon(HugeCheckIcon)
export const CheckCircle2 = createIcon(CheckmarkCircle02Icon)
export const CheckCircle = createIcon(CheckmarkCircle02Icon)
export const CircleCheck = createIcon(CheckmarkCircle02Icon)
export const X = createIcon(Cancel01Icon)
export const ImageOff = createIcon(PackageIcon)
export const ShoppingCart = createIcon(ShoppingCart01Icon)
export const Heart = createIcon(HeartIcon)
export const Plus = createIcon(Add01Icon)
export const Minus = createIcon(Remove01Icon)
export const Download = createIcon(Download01Icon)
export const Search = createIcon(Search01Icon)
export const Package = createIcon(PackageIcon)
export const PackageSearch = createIcon(Search01Icon)
export const Gift = createIcon(GiftIcon)
export const Wallet = createIcon(Wallet01Icon)
export const Layers = createIcon(Layers01Icon)
export const Sparkles = createIcon(SparklesIcon)
export const Star = createIcon(StarIcon)
export const Copy = createIcon(Copy01Icon)
export const Share2 = createIcon(Share01Icon)
export const Mail = createIcon(Mail01Icon)
export const MailCheck = createIcon(CheckmarkCircle02Icon)
export const Lock = createIcon(LockKeyIcon)
export const LockKeyhole = createIcon(LockKeyIcon)
export const User = createIcon(UserIcon)
export const Settings = createIcon(Settings01Icon)
export const Menu = createIcon(Menu01Icon)
export const Moon = createIcon(Moon02Icon)
export const Sun = createIcon(Sun03Icon)
export const Loader2 = createIcon(SparklesIcon)
export const ShieldCheck = createIcon(CheckmarkCircle02Icon)
export const Zap = createIcon(SparklesIcon)
export const BriefcaseBusiness = createIcon(PackageIcon)
export const Compass = createIcon(Search01Icon)
export const LayoutTemplate = createIcon(Layers01Icon)
export const WandSparkles = createIcon(SparklesIcon)
export const Coins = createIcon(Wallet01Icon)
export const Store = createIcon(PackageIcon)
export const CircleHelp = createIcon(CheckmarkCircle02Icon)
export const Headphones = createIcon(UserIcon)
export const HeadphonesIcon = createIcon(UserIcon)
export const RefreshCcw = createIcon(ArrowRight01Icon)
export const Send = createIcon(ArrowRight01Icon)
export const Printer = createIcon(PackageIcon)
export const Bell = createIcon(CheckmarkCircle02Icon)
export const Tag = createIcon(PackageIcon)
export const FolderDown = createIcon(Download01Icon)
export const SlidersHorizontal = createIcon(Settings01Icon)
export const Bitcoin = createIcon(Wallet01Icon)
export const CreditCard = createIcon(Wallet01Icon)
export const ShoppingBag = createIcon(ShoppingCart01Icon)
export const Flame = createIcon(SparklesIcon)
export const Quote = createIcon(Mail01Icon)
export const Globe2 = createIcon(Search01Icon)
export const ImageIcon = createIcon(PackageIcon)
export const FileCheck2 = createIcon(CheckmarkCircle02Icon)
export const PackageCheck = createIcon(CheckmarkCircle02Icon)
export const FileText = createIcon(PackageIcon)
export const Palette = createIcon(SparklesIcon)
export const Code2 = createIcon(Layers01Icon)
export const Shapes = createIcon(Layers01Icon)
export const Type = createIcon(Mail01Icon)
export const Music = createIcon(SparklesIcon)
export const Camera = createIcon(PackageIcon)
export const Box = createIcon(PackageIcon)
export const NotebookPen = createIcon(PackageIcon)
export const AlertTriangle = createIcon(CheckmarkCircle02Icon)
export const RotateCw = createIcon(ArrowRight01Icon)
export const GitCompareArrows = createIcon(ArrowRight01Icon)
export const LifeBuoy = createIcon(CheckmarkCircle02Icon)
export const LogOut = createIcon(ArrowRight01Icon)
export const LogIn = createIcon(ArrowRight01Icon)
export const MoreHorizontal = createIcon(ArrowRight01Icon)
export const Info = createIcon(CheckmarkCircle02Icon)
export const TriangleAlert = createIcon(CheckmarkCircle02Icon)
export const OctagonX = createIcon(Cancel01Icon)
export const FileIcon = createIcon(PackageIcon)
export const Upload = createIcon(Add01Icon)
export const Trash2 = createIcon(Cancel01Icon)
export const PanelLeft = createIcon(Menu01Icon)
export const ChevronUp = createIcon(ArrowUp01Icon)
export const ChevronDownIcon = createIcon(ArrowUp01Icon)
export const Loader2Icon = createIcon(SparklesIcon)
export const ArrowRightIcon = createIcon(ArrowRight01Icon)
export const ArrowDownIcon = createIcon(ArrowRight01Icon)
export const SearchIcon = createIcon(Search01Icon)
export const CheckIcon = createIcon(HugeCheckIcon)
export const XIcon = createIcon(Cancel01Icon)
export const MoreHorizontalIcon = createIcon(ArrowRight01Icon)
export const MinusIcon = createIcon(Remove01Icon)
export const ChevronRightIcon = createIcon(ArrowRight01Icon)
export const ChevronLeftIcon = createIcon(ArrowRight01Icon)
export const ChevronUpIcon = createIcon(ArrowUp01Icon)
export const InfoIcon = createIcon(CheckmarkCircle02Icon)
export const CircleCheckIcon = createIcon(CheckmarkCircle02Icon)
export const TriangleAlertIcon = createIcon(CheckmarkCircle02Icon)
export const OctagonXIcon = createIcon(Cancel01Icon)

export { HugeiconsIcon }
