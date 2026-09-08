import type { ReactNode, SVGProps } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Alert02Icon,
  BankIcon,
  AlertCircleIcon,
  ArrowDataTransferHorizontalIcon,
  ArrowDown02Icon,
  ArrowLeft02Icon,
  ArrowRight02Icon,
  ArrowUp02Icon,
  ArrowUpRight01Icon,
  Bitcoin01Icon,
  Bookmark02Icon,
  BookOpen01Icon,
  Briefcase01Icon,
  BubbleChatIcon,
  Building03Icon,
  Calendar03Icon,
  Camera01Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  Clock01Icon,
  CompassIcon,
  Copy01Icon,
  CreditCardIcon,
  CubeIcon,
  CustomerSupportIcon,
  DashboardSpeed01Icon,
  DashboardSquare01Icon,
  Delete02Icon,
  Download04Icon,
  FavouriteIcon,
  File02Icon,
  FileValidationIcon,
  FilterIcon,
  FireIcon,
  FlashIcon,
  GameController03Icon,
  GiftIcon,
  Globe02Icon,
  GridViewIcon,
  HeadphonesIcon as HugeHeadphonesIcon,
  HeartHandshakeIcon,
  HelpCircleIcon,
  Home01Icon,
  ImageNotFound01Icon,
  InformationCircleIcon,
  Invoice01Icon,
  Layers01Icon,
  Layout01Icon,
  LibraryIcon,
  LifebuoyIcon,
  Loading03Icon,
  LockKeyIcon,
  Login03Icon,
  Logout03Icon,
  MagicWand01Icon,
  Mail01Icon,
  MailValidation01Icon,
  Menu01Icon,
  Message01Icon,
  MinusSignIcon,
  Moon02Icon,
  MoreHorizontalIcon,
  MusicNote01Icon,
  Notification03Icon,
  PackageIcon,
  PackageSearchIcon,
  PaintBoardIcon,
  PlusSignIcon,
  PrinterIcon,
  RefreshIcon,
  Search01Icon,
  SearchRemoveIcon,
  SentIcon,
  Settings02Icon,
  Share08Icon,
  ShieldCheckIcon,
  ShoppingBag02Icon,
  ShoppingCart01Icon,
  SourceCodeIcon,
  SparklesIcon,
  SquareLock02Icon,
  StarIcon,
  Store01Icon,
  Sun03Icon,
  Tag01Icon,
  TextFontIcon,
  Tick02Icon,
  Undo02Icon,
  UserIcon,
  UserMultipleIcon,
  ViewIcon,
  ViewOffIcon,
  Wallet02Icon,
} from "@hugeicons/core-free-icons"

/**
 * Storefront icon set: Hugeicons (stroke, rounded). One barrel, semantic
 * names, so a glyph change is a one-line edit here. The component has no
 * hooks, so it renders identically in Server and Client Components.
 *
 * SIZING — use the `size` prop, not ad-hoc classNames:
 *   16  inline with body text, dense table/list rows
 *   18  default for buttons and controls
 *   20  navigation, header actions
 *   24  feature, department and empty-state icons
 *
 * WEIGHT — `weight="bold"` (or strokeWidth ≥ 2) thickens the stroke;
 * `weight="fill"` fills the shape (stars, hearts). Other weights render the
 * regular 1.5 stroke, so call sites written for the previous set keep working.
 */

export type IconSvg = readonly (readonly [string, { readonly [key: string]: string | number }])[]
export type IconWeight = "thin" | "light" | "regular" | "bold" | "fill" | "duotone"

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "ref" | "stroke" | "strokeWidth" | "color"> {
  size?: number | string
  strokeWidth?: number | string
  weight?: IconWeight
  color?: string
  className?: string
}
export type IconComponent = (props: IconProps) => ReactNode

/** Canonical icon sizes. Prefer these over arbitrary values. */
export const ICON_SIZE = {
  sm: 16,
  base: 18,
  nav: 20,
  feature: 24,
} as const

function joinClass(...parts: (string | undefined | false)[]) {
  return parts.filter(Boolean).join(" ") || undefined
}

function createIcon(icon: IconSvg): IconComponent {
  const Wrapped = ({ size = ICON_SIZE.base, strokeWidth, weight, className, ...props }: IconProps) => {
    const requested = strokeWidth !== undefined ? Number(strokeWidth) : undefined
    const bold = weight === "bold" || (requested !== undefined && requested >= 2)
    const width = requested ?? (bold ? 2 : 1.5)
    return (
      <HugeiconsIcon
        icon={icon as never}
        size={size}
        strokeWidth={width}
        className={joinClass(className, weight === "fill" && "[&_path]:fill-current")}
        {...props}
      />
    )
  }
  return Wrapped
}

// --- Direction -------------------------------------------------------------
export const ArrowRight = createIcon(ArrowRight02Icon)
export const ArrowLeft = createIcon(ArrowLeft02Icon)
export const ArrowUp = createIcon(ArrowUp02Icon)
export const ArrowDown = createIcon(ArrowDown02Icon)
export const ArrowUpRight = createIcon(ArrowUpRight01Icon)
export const ChevronRight = createIcon(ChevronRightIcon)
export const ChevronLeft = createIcon(ChevronLeftIcon)
export const ChevronDown = createIcon(ChevronDownIcon)
export const ChevronUp = createIcon(ChevronUpIcon)
export const Undo = createIcon(Undo02Icon)

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
export const ShoppingBag = createIcon(ShoppingBag02Icon)
export const Package = createIcon(PackageIcon)
export const Gift = createIcon(GiftIcon)
export const Tag = createIcon(Tag01Icon)
export const Wallet = createIcon(Wallet02Icon)
export const CreditCard = createIcon(CreditCardIcon)
export const Bank = createIcon(BankIcon)
export const Crypto = createIcon(Bitcoin01Icon)
export const Invoice = createIcon(Invoice01Icon)
export const Store = createIcon(Store01Icon)
export const ShieldCheck = createIcon(ShieldCheckIcon)
export const Lock = createIcon(LockKeyIcon)

// --- Files & content -------------------------------------------------------
export const Download = createIcon(Download04Icon)
export const Library = createIcon(LibraryIcon)
export const FileText = createIcon(File02Icon)
export const FileCheck = createIcon(FileValidationIcon)
export const Book = createIcon(BookOpen01Icon)
export const Printer = createIcon(PrinterIcon)

// --- Navigation & actions --------------------------------------------------
export const Search = createIcon(Search01Icon)
export const SearchEmpty = createIcon(SearchRemoveIcon)
export const Menu = createIcon(Menu01Icon)
export const Close = createIcon(Cancel01Icon)
export const Plus = createIcon(PlusSignIcon)
export const Trash = createIcon(Delete02Icon)
export const Filter = createIcon(FilterIcon)
export const Grid = createIcon(GridViewIcon)
export const GameController = createIcon(GameController03Icon)
export const LayoutTemplate = createIcon(Layout01Icon)
export const Dashboard = createIcon(DashboardSpeed01Icon)
export const Home = createIcon(Home01Icon)
export const MoreHorizontal = createIcon(MoreHorizontalIcon)
export const Layers = createIcon(Layers01Icon)
export const Settings = createIcon(Settings02Icon)

// --- People ----------------------------------------------------------------
export const User = createIcon(UserIcon)
export const Users = createIcon(UserMultipleIcon)
export const Building = createIcon(Building03Icon)

// --- Engagement ------------------------------------------------------------
export const Heart = createIcon(FavouriteIcon)
export const Bookmark = createIcon(Bookmark02Icon)
export const Star = createIcon(StarIcon)
export const Bell = createIcon(Notification03Icon)
export const Mail = createIcon(Mail01Icon)
export const MailCheck = createIcon(MailValidation01Icon)
export const Message = createIcon(Message01Icon)
export const Send = createIcon(SentIcon)
export const Support = createIcon(CustomerSupportIcon)
export const Headphones = createIcon(HugeHeadphonesIcon)
export const Sparkles = createIcon(SparklesIcon)
export const Flash = createIcon(FlashIcon)
export const Refresh = createIcon(RefreshIcon)
export const Copy = createIcon(Copy01Icon)
export const Eye = createIcon(ViewIcon)
export const EyeOff = createIcon(ViewOffIcon)
export const ImageOff = createIcon(ImageNotFound01Icon)
export const Calendar = createIcon(Calendar03Icon)

// --- Category / creative ---------------------------------------------------
export const PaintBoard = createIcon(PaintBoardIcon)
export const SourceCode = createIcon(SourceCodeIcon)
export const Cube = createIcon(CubeIcon)
export const TextFont = createIcon(TextFontIcon)
export const MusicNote = createIcon(MusicNote01Icon)
export const Camera = createIcon(Camera01Icon)

// --- Aliases kept for call-site compatibility ------------------------------
export const Loader2 = Spinner
export const Minus = createIcon(MinusSignIcon)
export const X = Close
export const LockKeyhole = createIcon(SquareLock02Icon)
export const Zap = Flash
export const PackageSearch = createIcon(PackageSearchIcon)
export const LifeBuoy = createIcon(LifebuoyIcon)
export const LogOut = createIcon(Logout03Icon)
export const LogIn = createIcon(Login03Icon)
export const BriefcaseBusiness = createIcon(Briefcase01Icon)
export const Briefcase = BriefcaseBusiness
export const CircleHelp = HelpCircle
export const Moon = createIcon(Moon02Icon)
export const Sun = createIcon(Sun03Icon)
export const Globe2 = createIcon(Globe02Icon)
export const HeadphonesIcon = Headphones
export const Compass = createIcon(CompassIcon)
export const Flame = createIcon(FireIcon)
export const WandSparkles = createIcon(MagicWand01Icon)
export const GitCompareArrows = createIcon(ArrowDataTransferHorizontalIcon)
export const Share2 = createIcon(Share08Icon)
export const ArrowRightIcon = ArrowRight
export const Building2 = Building
export const CheckCircle2 = CheckCircle
export const FileCheck2 = FileCheck
export const LayoutDashboard = createIcon(DashboardSquare01Icon)
export const RefreshCw = Refresh
export const RefreshCcw = Refresh
export const HeartHandshake = createIcon(HeartHandshakeIcon)
export const MessageCircle = createIcon(BubbleChatIcon)
