"use client"

import { motion } from "motion/react"
import { Download, ShieldCheck, Sparkles } from "@/lib/storefront-icons"

const items = [
  {
    number: "01",
    icon: Sparkles,
    title: "Curated, not crowded",
    body: "A department-store approach to digital products: useful collections, stronger discovery, less catalog noise.",
  },
  {
    number: "02",
    icon: ShieldCheck,
    title: "Know what you’re buying",
    body: "Licensing, formats, compatibility and product details are shown before the checkout decision.",
  },
  {
    number: "03",
    icon: Download,
    title: "Built for instant delivery",
    body: "Digital purchases move from secure payment into your library without shipping, packaging or waiting.",
  },
]

export function V4ValueBand() {
  return (
    <section className="bg-foreground py-20 text-background sm:py-24 lg:py-28">
      <div className="mx-auto max-w-[1540px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
          >
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.16em] text-primary">Why DistroSource</p>
            <h2 className="mt-4 font-display text-[clamp(2.6rem,5.5vw,5.8rem)] font-black leading-[0.9] tracking-[-0.065em]">
              Find it.
              <span className="block text-background/35">Understand it.</span>
              Build with it.
            </h2>
          </motion.div>

          <div className="divide-y divide-white/12 border-y border-white/12">
            {items.map((item, index) => (
              <motion.article
                key={item.number}
                initial={{ opacity: 0, x: 22 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: index * 0.07 }}
                className="group grid gap-5 py-7 sm:grid-cols-[54px_1fr_auto] sm:items-center sm:py-8"
              >
                <span className="font-mono text-[10px] font-black text-background/30">{item.number}</span>
                <div>
                  <h3 className="font-display text-xl font-black tracking-[-0.035em] sm:text-2xl">{item.title}</h3>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-background/55">{item.body}</p>
                </div>
                <span className="flex size-12 items-center justify-center rounded-full border border-white/14 text-primary transition-[background-color,color,transform] group-hover:rotate-6 group-hover:bg-primary group-hover:text-primary-foreground">
                  <item.icon size={19} />
                </span>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
