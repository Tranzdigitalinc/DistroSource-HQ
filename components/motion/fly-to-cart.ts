/**
 * Flies a clone of a product image into the header cart button using the
 * Web Animations API, then pulses the cart. Purely decorative: the real
 * add happened on the server before this is called. No-op under reduced
 * motion or when either element is missing.
 */
export function flyToCart(source: HTMLElement | null) {
  if (typeof window === "undefined" || !source) return
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
  const target = document.getElementById("cart-anchor")
  if (!target) return

  const from = source.getBoundingClientRect()
  const to = target.getBoundingClientRect()
  if (from.width === 0 || to.width === 0) return

  const clone = source.cloneNode(true) as HTMLElement
  Object.assign(clone.style, {
    position: "fixed",
    left: `${from.left}px`,
    top: `${from.top}px`,
    width: `${from.width}px`,
    height: `${from.height}px`,
    borderRadius: "12px",
    objectFit: "cover",
    zIndex: "80",
    pointerEvents: "none",
    margin: "0",
    boxShadow: "0 24px 48px -12px rgba(0,0,0,.35)",
  } as CSSStyleDeclaration)
  document.body.appendChild(clone)

  const dx = to.left + to.width / 2 - (from.left + from.width / 2)
  const dy = to.top + to.height / 2 - (from.top + from.height / 2)
  const scale = Math.max(0.08, (to.width * 0.9) / from.width)

  const anim = clone.animate(
    [
      { transform: "translate(0,0) scale(1)", opacity: 1, offset: 0 },
      { transform: `translate(${dx * 0.55}px, ${dy * 0.35 - 90}px) scale(${Math.max(scale, 0.5)})`, opacity: 1, offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px) scale(${scale})`, opacity: 0.2, offset: 1 },
    ],
    { duration: 720, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" },
  )
  anim.onfinish = () => {
    clone.remove()
    target.animate([{ transform: "scale(1)" }, { transform: "scale(1.25)" }, { transform: "scale(1)" }], { duration: 360, easing: "ease-out" })
  }
}
