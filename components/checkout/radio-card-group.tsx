"use client"

import { Check, ICON_SIZE } from "@/lib/storefront-icons"
import { cn } from "@/lib/utils"

export interface RadioCardOption<T extends string> {
  id: T
  label: string
  description?: string
  icon?: React.ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean | "true" }>
  /** Rendered under the description when this option is selected. */
  detail?: React.ReactNode
}

/**
 * The selection control used for payment provider and sub-method choice.
 *
 * These were previously buttons with `aria-pressed`, which announces as a
 * toggle rather than a choice between mutually exclusive options, gave no
 * arrow-key navigation, and signalled selection with a border tint alone.
 * This is a real radio group: one tab stop, arrows move and select, and the
 * chosen option carries a visible check as well as the colour change.
 */
export function RadioCardGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  columns = 3,
  className,
}: {
  label: string
  options: RadioCardOption<T>[]
  value: T
  onChange: (id: T) => void
  columns?: 2 | 3
  className?: string
}) {
  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"].includes(e.key)) return
    e.preventDefault()
    const index = Math.max(0, options.findIndex((o) => o.id === value))
    const delta = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1
    const next = options[(index + delta + options.length) % options.length]
    onChange(next.id)
    e.currentTarget.querySelector<HTMLElement>(`[data-option-id="${next.id}"]`)?.focus()
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn("grid grid-cols-1 gap-3", columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3", className)}
    >
      {options.map((option) => {
        const selected = option.id === value
        const Icon = option.icon
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            data-option-id={option.id}
            onClick={() => onChange(option.id)}
            className={cn(
              "group relative flex items-start gap-3 rounded-lg border px-4 py-3 text-left transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              selected ? "border-foreground bg-secondary/50" : "border-border hover:border-border-strong hover:bg-secondary/20",
            )}
          >
            {Icon && <Icon size={ICON_SIZE.base} className="mt-0.5 shrink-0 text-foreground" aria-hidden="true" />}
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{option.label}</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "ml-auto flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                    selected ? "border-foreground bg-foreground text-background" : "border-border-strong",
                  )}
                >
                  {selected && <Check size={10} strokeWidth={3} />}
                </span>
              </span>
              {option.description && <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{option.description}</span>}
              {selected && option.detail}
            </span>
          </button>
        )
      })}
    </div>
  )
}
