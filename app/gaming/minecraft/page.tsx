import type { Metadata } from "next"
import { V4GamingPlatformPage } from "@/components/v4/gaming-platform-page"

export const metadata: Metadata = {
  title: "Minecraft Maps, Server Packs & Resources | DistroSource",
  description: "Premium Minecraft maps, server packs, resource packs, configurations and interfaces for Java Edition servers.",
  alternates: { canonical: "/gaming/minecraft" },
}

export default function MinecraftPage() {
  return (
    <V4GamingPlatformPage
      platform="minecraft"
      eyebrow="Minecraft resources"
      title="Build a Minecraft server players remember."
      description="Worlds, server packs, resource packs, interfaces and tuned configurations for Minecraft communities — presented as one focused DistroSource collection."
    />
  )
}
