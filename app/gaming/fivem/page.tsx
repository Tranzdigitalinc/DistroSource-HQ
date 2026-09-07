import type { Metadata } from "next"
import { V5GamingPlatformPage } from "@/components/v5/gaming-platform-page"

export const metadata: Metadata = {
  title: "FiveM Maps, MLOs, UI & Server Resources | DistroSource",
  description: "Premium FiveM maps, MLOs, interfaces, gameplay systems and server resources for modern FiveM communities.",
  alternates: { canonical: "/gaming/fivem" },
}

export default function FivemPage() {
  return (
    <V5GamingPlatformPage
      platform="fivem"
      eyebrow="FiveM Resources"
      title="Build a server people remember."
      description="Premium maps, interfaces, gameplay systems and server resources selected for modern FiveM communities."
    />
  )
}
