"use client"

import { useEffect, useState } from "react"
import { LiteMarkdown } from "@/components/product/lite-markdown"
import type { ProductSection } from "@/components/product/product-sections.shared"
import { cn } from "@/lib/utils"

export type { ProductSection }

/**
 * Renders a product's long-form description as anchored sections with a
 * sticky in-page navigation, instead of one undifferentiated "Details" tab.
 *
 * Parsing lives in `product-sections.shared.ts` so the Server Component page
 * can build the section list; this module only renders it.
 */
export function ProductSections({ sections }: { sections: ProductSection[] }) {
  const [active, setActive] = useState<string>(sections[0]?.id ?? "")

  // Highlight the section nearest the reading line as the user scrolls. The
  // observer window sits ~20% down the viewport so the highlight changes when
  // a heading crosses where the eye actually is, not at the very top edge.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return
    const els = sections.map((s) => document.getElementById(`section-${s.id}`)).filter(Boolean) as HTMLElement[]
    if (!els.length) return
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id.replace("section-", ""))
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [sections])

  if (!sections.length) return null

  return (
    <div className="flex flex-col gap-8">
      <nav
        aria-label="On this page"
        className="sticky top-[4.75rem] z-20 -mx-5 border-y border-border bg-background/90 px-5 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:top-[5rem] md:mx-0 md:rounded-full md:border md:px-2"
      >
        <ul className="flex gap-1 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {sections.map((s) => (
            <li key={s.id} className="shrink-0">
              <a
                href={`#section-${s.id}`}
                aria-current={active === s.id ? "location" : undefined}
                className={cn(
                  "block whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active === s.id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex flex-col divide-y divide-border">
        {sections.map((s) => (
          <section key={s.id} id={`section-${s.id}`} className="scroll-mt-32 py-8 first:pt-0 last:pb-0">
            <h2 className="text-title mb-5 text-xl sm:text-2xl">{s.title}</h2>
            {typeof s.body === "string" ? <LiteMarkdown text={s.body} className="flex max-w-3xl flex-col gap-4" /> : s.body}
          </section>
        ))}
      </div>
    </div>
  )
}
