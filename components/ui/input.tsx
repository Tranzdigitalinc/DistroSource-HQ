import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

/**
 * 40px by default so an input and a default Button line up exactly; `lg`
 * (44px) matches Button `lg` for primary forms such as sign-in and checkout.
 * The vendored 32px height was a dashboard size and read as cramped on a
 * storefront form.
 */
function Input({
  className,
  type,
  inputSize = "default",
  ...props
}: React.ComponentProps<"input"> & { inputSize?: "sm" | "default" | "lg" }) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      data-size={inputSize}
      className={cn(
        "w-full min-w-0 rounded-lg border border-input bg-transparent text-base transition-colors outline-none",
        "file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
        "md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        inputSize === "sm" && "h-9 px-3 py-1",
        inputSize === "default" && "h-10 px-3 py-1",
        inputSize === "lg" && "h-11 px-3.5 py-1",
        className
      )}
      {...props}
    />
  )
}

export { Input }
