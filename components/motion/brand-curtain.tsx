"use client"

import Image from "next/image"
import { useEffect, useState, useSyncExternalStore } from "react"
import { AnimatePresence, motion } from "motion/react"

const BOOT_KEY = "ds:booted"
const MIN_SHOW_MS = 1400
const noop = () => () => {}
const readBooted = () => {
  try {
    return sessionStorage.getItem(BOOT_KEY) === "1"
  } catch {
    return true
  }
}

/**
 * First-load curtain, mounted once in the root layout. The first page of a
 * session opens under a navy curtain: the wordmark wipes in, an orange line
 * runs, and once the document has loaded (and at least MIN_SHOW_MS have
 * passed) the curtain lifts away to reveal the page. Later route changes
 * never see it — the top loading bar carries navigation feedback.
 */
export function BrandCurtain() {
  // Server render paints the curtain so there is no blank frame; the client
  // then reads the session flag and either keeps it or drops it at once.
  const booted = useSyncExternalStore(noop, readBooted, () => false)
  const [lifted, setLifted] = useState(false)

  useEffect(() => {
    if (booted) return
    const started = performance.now()
    let timer: number | undefined
    const lift = () => {
      const wait = Math.max(0, MIN_SHOW_MS - (performance.now() - started))
      timer = window.setTimeout(() => {
        setLifted(true)
        try {
          sessionStorage.setItem(BOOT_KEY, "1")
        } catch {}
      }, wait)
    }
    if (document.readyState === "complete") lift()
    else window.addEventListener("load", lift, { once: true })
    return () => {
      window.removeEventListener("load", lift)
      if (timer) window.clearTimeout(timer)
    }
  }, [booted])

  const visible = !booted && !lifted

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="curtain"
          aria-busy="true"
          aria-label="Loading DistroSource"
          initial={false}
          exit={{ clipPath: "inset(0 0 100% 0)", transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] } }}
          style={{ clipPath: "inset(0 0 0% 0)" }}
          className="grain fixed inset-0 z-[100] flex flex-col items-center justify-center bg-navy-deep text-navy-foreground"
        >
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="mesh-blob animate-mesh-1 left-[-10%] top-[-20%] h-[40rem] w-[40rem] bg-primary/25" />
            <div className="mesh-blob animate-mesh-2 bottom-[-20%] right-[-10%] h-[36rem] w-[36rem] bg-[oklch(0.5_0.12_260)]/40" />
          </div>

          <motion.div exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }} className="relative flex flex-col items-center gap-8">
            <motion.div
              initial={{ clipPath: "inset(0 100% 0 0)", opacity: 0.4 }}
              animate={{ clipPath: "inset(0 0% 0 0)", opacity: 1 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="relative h-12 w-[16rem] sm:h-14 sm:w-[20rem]"
            >
              <Image src="/images/distro-source-logo-dark.png" alt="DistroSource" fill priority sizes="20rem" className="object-contain" />
            </motion.div>

            <div className="relative h-[3px] w-40 overflow-hidden rounded-full bg-navy-foreground/10">
              <motion.span
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1.1, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
                className="absolute inset-y-0 w-1/2 rounded-full bg-primary"
              />
            </div>

            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="font-mono text-[11px] uppercase tracking-[0.18em] text-navy-foreground/50"
            >
              Everything digital. One source.
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
