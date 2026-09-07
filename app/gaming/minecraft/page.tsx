import type { Metadata } from "next"
import { V5GamingPlatformPage } from "@/components/v5/gaming-platform-page"

export const metadata: Metadata = {
  title: "Minecraft Maps, Server Packs & Resources | DistroSource",
  description: "Premium Minecraft maps, server packs, resource packs, configurations and interfaces for Java Edition servers.",
  alternates: { canonical: "/gaming/minecraft" },
}

export default function MinecraftPage() {
  return (
    <V5GamingPlatformPage
      platform="minecraft"
      eyebrow="Minecraft Resources"
      title="Build a world worth staying in."
      description="Maps, server packs, resource packs and tuned configurations for Minecraft communities that care about the details."
    />
  )
}
