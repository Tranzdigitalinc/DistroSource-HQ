import type { ReactNode } from "react"
import type { Icon as PhosphorIcon, IconProps as PhosphorProps, IconWeight } from "@phosphor-icons/react"
// The `ssr` entry has no context provider, so it renders identically in
// Server and Client Components.
import {
  ArrowRight as PArrowRight,
  ArrowLeft as PArrowLeft,
  ArrowUp as PArrowUp,
  ArrowDown as PArrowDown,
  ArrowUpRight as PArrowUpRight,
  ArrowUUpLeft,
  ArrowsClockwise,
  ArrowsLeftRight,
  Bell as PBell,
  BookOpen,
  BookmarkSimple,
  Briefcase as PBriefcase,
  Buildings,
  CalendarBlank,
  Camera as PCamera,
  CaretDown,
  CaretLeft,
  CaretRight,
  CaretUp,
  ChatCircle,
  ChatCircleDots,
  Check as PCheck,
  CheckCircle as PCheckCircle,
  CircleNotch,
  Clock as PClock,
  Code,
  Compass as PCompass,
  Copy as PCopy,
  CreditCard as PCreditCard,
  Cube as PCube,
  DotsThree,
  DownloadSimple,
  EnvelopeSimple,
  EnvelopeSimpleOpen,
  Eye as PEye,
  EyeSlash,
  FileText as PFileText,
  Flame as PFlame,
  FunnelSimple,
  GameController as PGameController,
  Gauge,
  GearSix,
  Gift as PGift,
  Globe,
  Handbag,
  Handshake,
  Headphones as PHeadphones,
  Headset,
  Heart as PHeart,
  House,
  ImageBroken,
  Info as PInfo,
  Layout,
  Lifebuoy,
  Lightning,
  List,
  Lock as PLock,
  LockKey,
  MagicWand,
  MagnifyingGlass,
  MagnifyingGlassMinus,
  Minus as PMinus,
  Moon as PMoon,
  MusicNote as PMusicNote,
  Package as PPackage,
  Palette,
  PaperPlaneTilt,
  Plus as PPlus,
  Printer as PPrinter,
  Question,
  Receipt,
  SealCheck,
  ShareNetwork,
  ShieldCheck as PShieldCheck,
  ShoppingCart as PShoppingCart,
  SignIn,
  SignOut,
  Sparkle,
  SquaresFour,
  Stack,
  Star as PStar,
  Storefront,
  Sun as PSun,
  Tag as PTag,
  TextAa,
  Trash as PTrash,
  User as PUser,
  UsersThree,
  Wallet as PWallet,
  Warning,
  WarningCircle,
  X as PX,
  Books,
} from "@phosphor-icons/react/dist/ssr"

/**
 * Storefront icon set: Phosphor. One barrel, semantic names, so a glyph
 * change is a one-line edit here.
 *
 * SIZING — use the `size` prop, not ad-hoc classNames:
 *   16  inline with body text, dense table/list rows
 *   18  default for buttons and controls
 *   20  navigation, header actions
 *   24  feature, department and empty-state icons
 *
 * `strokeWidth` is accepted for call-site compatibility: ≥ 2 maps to the
 * bold weight, otherwise regular. `weight="duotone"` is the feature style.
 */

export interface IconProps extends Omit<PhosphorProps, "weight"> {
  strokeWidth?: number
  weight?: IconWeight
}
export type IconComponent = (props: IconProps) => ReactNode

/** Canonical icon sizes. Prefer these over arbitrary values. */
export const ICON_SIZE = {
  sm: 16,
  base: 18,
  nav: 20,
  feature: 24,
} as const

function createIcon(Icon: PhosphorIcon): IconComponent {
  const Wrapped = ({ size = ICON_SIZE.base, strokeWidth, weight, ...props }: IconProps) => (
    <Icon size={size} weight={weight ?? (strokeWidth !== undefined && strokeWidth >= 2 ? "bold" : "regular")} {...props} />
  )
  return Wrapped
}

// --- Direction -------------------------------------------------------------
export const ArrowRight = createIcon(PArrowRight)
export const ArrowLeft = createIcon(PArrowLeft)
export const ArrowUp = createIcon(PArrowUp)
export const ArrowDown = createIcon(PArrowDown)
export const ChevronRight = createIcon(CaretRight)
export const ChevronLeft = createIcon(CaretLeft)
export const ChevronDown = createIcon(CaretDown)
export const ChevronUp = createIcon(CaretUp)
export const Undo = createIcon(ArrowUUpLeft)

// --- Status ----------------------------------------------------------------
export const Check = createIcon(PCheck)
export const CheckCircle = createIcon(PCheckCircle)
export const AlertTriangle = createIcon(Warning)
export const AlertCircle = createIcon(WarningCircle)
export const Info = createIcon(PInfo)
export const HelpCircle = createIcon(Question)
export const Spinner = createIcon(CircleNotch)
export const Clock = createIcon(PClock)

// --- Commerce --------------------------------------------------------------
export const ShoppingCart = createIcon(PShoppingCart)
export const ShoppingBag = createIcon(Handbag)
export const Package = createIcon(PPackage)
export const Gift = createIcon(PGift)
export const Tag = createIcon(PTag)
export const Wallet = createIcon(PWallet)
export const CreditCard = createIcon(PCreditCard)
export const Invoice = createIcon(Receipt)
export const Store = createIcon(Storefront)

// --- Trust and security ----------------------------------------------------
export const ShieldCheck = createIcon(PShieldCheck)
export const Lock = createIcon(LockKey)

// --- Library and files -----------------------------------------------------
export const Download = createIcon(DownloadSimple)
export const Library = createIcon(Books)
export const FileText = createIcon(PFileText)
export const FileCheck = createIcon(SealCheck)
export const Book = createIcon(BookOpen)
export const Printer = createIcon(PPrinter)

// --- Navigation and layout -------------------------------------------------
export const Search = createIcon(MagnifyingGlass)
export const SearchEmpty = createIcon(MagnifyingGlassMinus)
export const Menu = createIcon(List)
export const Close = createIcon(PX)
export const Plus = createIcon(PPlus)
export const Trash = createIcon(PTrash)
export const Filter = createIcon(FunnelSimple)
export const Grid = createIcon(SquaresFour)
export const GameController = createIcon(PGameController)
export const LayoutTemplate = createIcon(Layout)
export const Dashboard = createIcon(Gauge)
export const Home = createIcon(House)
export const MoreHorizontal = createIcon(DotsThree)
export const Layers = createIcon(Stack)
export const Settings = createIcon(GearSix)

// --- Account and people ----------------------------------------------------
export const User = createIcon(PUser)
export const Users = createIcon(UsersThree)
export const Building = createIcon(Buildings)
export const Heart = createIcon(PHeart)
export const Bookmark = createIcon(BookmarkSimple)
export const Star = createIcon(PStar)
export const Bell = createIcon(PBell)

// --- Communication ---------------------------------------------------------
export const Mail = createIcon(EnvelopeSimple)
export const MailCheck = createIcon(EnvelopeSimpleOpen)
export const Message = createIcon(ChatCircle)
export const Send = createIcon(PaperPlaneTilt)
export const Support = createIcon(Headset)
export const Headphones = createIcon(PHeadphones)

// --- Misc ------------------------------------------------------------------
export const Sparkles = createIcon(Sparkle)
export const Flash = createIcon(Lightning)
export const Refresh = createIcon(ArrowsClockwise)
export const Copy = createIcon(PCopy)
export const Eye = createIcon(PEye)
export const EyeOff = createIcon(EyeSlash)
export const ImageOff = createIcon(ImageBroken)
export const Calendar = createIcon(CalendarBlank)
export const PaintBoard = createIcon(Palette)
export const SourceCode = createIcon(Code)
export const Cube = createIcon(PCube)
export const TextFont = createIcon(TextAa)
export const MusicNote = createIcon(PMusicNote)
export const Camera = createIcon(PCamera)

// --- Lucide-style aliases used at existing call sites ----------------------
export const Loader2 = createIcon(CircleNotch)
export const Minus = createIcon(PMinus)
export const X = createIcon(PX)
export const ArrowUpRight = createIcon(PArrowUpRight)
export const LockKeyhole = createIcon(PLock)
export const Zap = createIcon(Lightning)
export const PackageSearch = createIcon(PPackage)
export const LifeBuoy = createIcon(Lifebuoy)
export const LogOut = createIcon(SignOut)
export const LogIn = createIcon(SignIn)
export const BriefcaseBusiness = createIcon(PBriefcase)
export const Briefcase = createIcon(PBriefcase)
export const CircleHelp = createIcon(Question)
export const Moon = createIcon(PMoon)
export const Sun = createIcon(PSun)
export const Globe2 = createIcon(Globe)
export const HeadphonesIcon = createIcon(PHeadphones)
export const Compass = createIcon(PCompass)
export const Flame = createIcon(PFlame)
export const WandSparkles = createIcon(MagicWand)
export const GitCompareArrows = createIcon(ArrowsLeftRight)
export const Share2 = createIcon(ShareNetwork)
export const ArrowRightIcon = ArrowRight
export const Building2 = Building
export const CheckCircle2 = CheckCircle
export const FileCheck2 = FileCheck
export const LayoutDashboard = Dashboard
export const RefreshCw = Refresh
export const RefreshCcw = Refresh
export const HeartHandshake = createIcon(Handshake)
export const MessageCircle = createIcon(ChatCircleDots)
