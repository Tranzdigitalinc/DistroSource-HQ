"use client"

import { motion } from "motion/react"
import { EASE_OUT } from "@/components/motion/reveal"
import { cn } from "@/lib/utils"

/**
 * Word-by-word reveal for display headlines. Each word rises from behind a
 * clip so the line reads as it is typeset, not as it fades in. Pass
 * `accentFrom` to colour the tail of the sentence (e.g. "One source.").
 */
const TAGS = { h1: motion.h1, h2: motion.h2, p: motion.p, span: motion.span } as const

export function SplitText({
  text,
  className,
  delay = 0,
  stagger = 0.05,
  accentFrom,
  as: Tag = "h1",
  inView = false,
}: {
  text: string
  className?: string
  delay?: number
  stagger?: number
  /** Word index from which the accent colour applies. */
  accentFrom?: number
  as?: "h1" | "h2" | "p" | "span"
  inView?: boolean
}) {
  const words = text.split(" ")
  const MotionTag = TAGS[Tag]
  return (
    <MotionTag
      className={cn("flex flex-wrap", className)}
      initial="hidden"
      {...(inView ? { whileInView: "visible", viewport: { once: true, margin: "-60px" } } : { animate: "visible" })}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
      aria-label={text}
    >
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="mr-[0.24em] overflow-hidden pb-[0.08em] last:mr-0" aria-hidden="true">
          <motion.span
            className={cn("inline-block", accentFrom !== undefined && i >= accentFrom && "text-primary")}
            variants={{ hidden: { y: "110%", opacity: 0 }, visible: { y: 0, opacity: 1 } }}
            transition={{ duration: 0.7, ease: EASE_OUT }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  )
}
