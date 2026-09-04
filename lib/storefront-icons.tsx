import type { ComponentProps, ReactNode } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  ArrowDataTransferHorizontalIcon,
  ArrowUpRight01Icon,
  Alert02Icon,
  AlertCircleIcon,
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowTurnBackwardIcon,
  ArrowUp01Icon,
  Book01Icon,
  Bookmark01Icon,
  Briefcase01Icon,
  BriefcaseBusinessIcon,
  Building01Icon,
  Calendar01Icon,
  Camera01Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  CompassIcon,
  Copy01Icon,
  CreditCardIcon,
  CubeIcon,
  CustomerSupportIcon,
  DashboardSquare01Icon,
  Delete02Icon,
  Download01Icon,
  File01Icon,
  FileValidationIcon,
  FilterIcon,
  FireIcon,
  FlashIcon,
  GiftIcon,
  Globe02Icon,
  GridViewIcon,
  HeadphonesIcon as HeadphonesIcon_,
  HandshakeIcon,
  HeartIcon,
  HelpCircleIcon,
  Home01Icon,
  ImageNotFound01Icon,
  LifebuoyIcon,
  Login01Icon,
  Logout01Icon,
  InformationCircleIcon,
  Invoice01Icon,
  Layers01Icon,
  LayoutTableIcon,
  LibraryIcon,
  Loading03Icon,
  LockKeyIcon,
  Mail01Icon,
  MailValidation01Icon,
  MagicWand01Icon,
  Menu01Icon,
  Message01Icon,
  Message02Icon,
  MinusSignIcon,
  Moon02Icon,
  MoreHorizontalIcon,
  MusicNote01Icon,
  Notification01Icon,
  PackageIcon,
  PackageSearchIcon,
  PaintBoardIcon,
  PrinterIcon,
  RefreshIcon,
  Search01Icon,
  SearchRemoveIcon,
  SecurityCheckIcon,
  SentIcon,
  Share08Icon,
  Settings01Icon,
  ShoppingBag01Icon,
  ShoppingCart01Icon,
  SourceCodeIcon,
  SquareLock02Icon,
  SparklesIcon,
  StarIcon,
  Sun03Icon,
  Store01Icon,
  Tag01Icon,
  TextFontIcon,
  Tick02Icon,
  UserIcon,
  UserMultipleIcon,
  ViewIcon,
  ViewOffIcon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons"

/**
 * The storefront icon system — Hugeicons, one glyph per meaning.
 *
 * This module previously mapped ~90 names onto ~25 glyphs, which is why no
 * component ever adopted it: `AlertTriangle` rendered a checkmark, `Loader2`
 * rendered sparkles, and all four chevron directions pointed the same way.
 * Every export below is now a distinct, semantically correct icon.
 *
 * SIZING — use the `size` prop, not ad-hoc classNames, so icon scale stays
 * consistent across the storefront:
 *   16  inline with body text, dense table/list rows
 *   18  default for buttons and controls
 *   20  navigation, header actions
 *   24  feature, department and empty-state icons
 *
 * Hugeicons renders an SVG that inherits `currentColor` and takes
 * `strokeWidth` (default 1.5, which matches the UI's hairline borders).
 */

type HugeiconProps = ComponentProps<typeof HugeiconsIcon>
type IconProps = Omit<HugeiconProps, "icon">

export type IconComponent = (props: IconProps) => ReactNode

/** Canonical icon sizes. Prefer these over arbitrary values. */
export const ICON_SIZE = {
  sm: 16,
  base: 18,
  nav: 20,
  feature: 24,
} as const

function createIcon(icon: HugeiconProps["icon"]): IconComponent {
  const Icon = ({ size = ICON_SIZE.base, strokeWidth = 1.5, ...props }: IconProps) => (
    <HugeiconsIcon icon={icon} size={size} strokeWidth={strokeWidth} {...props} />
  )
  return Icon
}

// --- Direction -------------------------------------------------------------
export const ArrowRight = createIcon(ArrowRight01Icon)
export const ArrowLeft = createIcon(ArrowLeft01Icon)
export const ArrowUp = createIcon(ArrowUp01Icon)
export const ArrowDown = createIcon(ArrowDown01Icon)
export const ChevronRight = createIcon(ArrowRight01Icon)
export const ChevronLeft = createIcon(ArrowLeft01Icon)
export const ChevronDown = createIcon(ArrowDown01Icon)
export const ChevronUp = createIcon(ArrowUp01Icon)
export const Undo = createIcon(ArrowTurnBackwardIcon)

// --- Status ----------------------------------------------------------------
export const Check = createIcon(Tick02Icon)
export const CheckCircle = createIcon(CheckmarkCircle02Icon)
export const AlertTriangle = createIcon(Alert02Icon)
export const AlertCircle = createIcon(AlertCircleIcon)
export const Info = createIcon(InformationCircleIcon)
export const HelpCircle = createIcon(HelpCircleIcon)
export const Spinner = createIcon(Loading03Icon)
export const Clock = createIcon(Clock01Icon)

// --- Commerce --------------------------------------------------------------
export const ShoppingCart = createIcon(ShoppingCart01Icon)
export const ShoppingBag = createIcon(ShoppingBag01Icon)
export const Package = createIcon(PackageIcon)
export const Gift = createIcon(GiftIcon)
export const Tag = createIcon(Tag01Icon)
export const Wallet = createIcon(Wallet01Icon)
export const CreditCard = createIcon(CreditCardIcon)
export const Invoice = createIcon(Invoice01Icon)
export const Store = createIcon(Store01Icon)

// --- Trust and security ----------------------------------------------------
export const ShieldCheck = createIcon(SecurityCheckIcon)
export const Lock = createIcon(LockKeyIcon)

// --- Library and files -----------------------------------------------------
export const Download = createIcon(Download01Icon)
export const Library = createIcon(LibraryIcon)
export const FileText = createIcon(File01Icon)
export const FileCheck = createIcon(FileValidationIcon)
export const Book = createIcon(Book01Icon)
export const Printer = createIcon(PrinterIcon)

// --- Navigation and layout -------------------------------------------------
export const Search = createIcon(Search01Icon)
export const SearchEmpty = createIcon(SearchRemoveIcon)
export const Menu = createIcon(Menu01Icon)
export const Close = createIcon(Cancel01Icon)
export const Plus = createIcon(Add01Icon)
export const Trash = createIcon(Delete02Icon)
export const Filter = createIcon(FilterIcon)
export const Grid = createIcon(GridViewIcon)
export const LayoutTemplate = createIcon(LayoutTableIcon)
export const Dashboard = createIcon(DashboardSquare01Icon)
export const Home = createIcon(Home01Icon)
export const MoreHorizontal = createIcon(MoreHorizontalIcon)
export const Layers = createIcon(Layers01Icon)
export const Settings = createIcon(Settings01Icon)

// --- Account and people ----------------------------------------------------
export const User = createIcon(UserIcon)
export const Users = createIcon(UserMultipleIcon)
export const Building = createIcon(Building01Icon)
export const Heart = createIcon(HeartIcon)
export const Bookmark = createIcon(Bookmark01Icon)
export const Star = createIcon(StarIcon)
export const Bell = createIcon(Notification01Icon)

// --- Communication ---------------------------------------------------------
export const Mail = createIcon(Mail01Icon)
export const MailCheck = createIcon(MailValidation01Icon)
export const Message = createIcon(Message01Icon)
export const Send = createIcon(SentIcon)
export const Support = createIcon(CustomerSupportIcon)
export const Headphones = createIcon(HeadphonesIcon_)

// --- Content and category --------------------------------------------------
export const Sparkles = createIcon(SparklesIcon)
export const Flash = createIcon(FlashIcon)
export const Refresh = createIcon(RefreshIcon)
export const Copy = createIcon(Copy01Icon)
export const Eye = createIcon(ViewIcon)
export const EyeOff = createIcon(ViewOffIcon)
export const ImageOff = createIcon(ImageNotFound01Icon)
export const Calendar = createIcon(Calendar01Icon)
export const PaintBoard = createIcon(PaintBoardIcon)
export const SourceCode = createIcon(SourceCodeIcon)
export const Cube = createIcon(CubeIcon)
export const TextFont = createIcon(TextFontIcon)
export const MusicNote = createIcon(MusicNote01Icon)
export const Camera = createIcon(Camera01Icon)

// --- Compatibility aliases -------------------------------------------------
// Names the storefront already imports. Kept as named exports so existing
// call sites keep working, each pointing at a semantically correct glyph.
export const Loader2 = createIcon(Loading03Icon)
export const Minus = createIcon(MinusSignIcon)
export const X = createIcon(Cancel01Icon)
export const ArrowUpRight = createIcon(ArrowUpRight01Icon)
export const LockKeyhole = createIcon(SquareLock02Icon)
export const Zap = createIcon(FlashIcon)
export const PackageSearch = createIcon(PackageSearchIcon)
export const LifeBuoy = createIcon(LifebuoyIcon)
export const LogOut = createIcon(Logout01Icon)
export const LogIn = createIcon(Login01Icon)
export const BriefcaseBusiness = createIcon(BriefcaseBusinessIcon)
export const Briefcase = createIcon(Briefcase01Icon)
export const CircleHelp = createIcon(HelpCircleIcon)
export const Moon = createIcon(Moon02Icon)
export const Sun = createIcon(Sun03Icon)
export const Globe2 = createIcon(Globe02Icon)
export const HeadphonesIcon = createIcon(HeadphonesIcon_)
export const Compass = createIcon(CompassIcon)
export const Flame = createIcon(FireIcon)
export const WandSparkles = createIcon(MagicWand01Icon)
export const GitCompareArrows = createIcon(ArrowDataTransferHorizontalIcon)
export const Share2 = createIcon(Share08Icon)

// Aliases for Lucide names still present at existing call sites. Each maps to
// the same glyph as its canonical export above, so the two never diverge.
export const ArrowRightIcon = ArrowRight
export const Building2 = Building
export const CheckCircle2 = CheckCircle
export const FileCheck2 = FileCheck
export const LayoutDashboard = Dashboard
export const RefreshCw = Refresh
export const RefreshCcw = Refresh
export const HeartHandshake = createIcon(HandshakeIcon)
export const MessageCircle = createIcon(Message02Icon)
