import type { Metadata } from "next"
import { V4GamingPlatformPage } from "@/components/v4/gaming-platform-page"

export const metadata: Metadata = {
  title: "FiveM Maps, MLOs, UI & Server Resources | DistroSource",
  description: "Premium FiveM maps, MLOs, interfaces, gameplay systems and server resources for modern FiveM communities.",
  alternates: { canonical: "/gaming/fivem" },
}

export default function FivemPage() {
  return (
    <V4GamingPlatformPage
      platform="fivem"
      eyebrow="FiveM resources"
      title="Build a FiveM world worth staying in."
      description="Maps, interfaces, gameplay systems, server infrastructure and visual resources for modern FiveM communities — curated inside DistroSource Gaming."
    />
  )
}
