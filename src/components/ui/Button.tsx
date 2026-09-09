import { ButtonHTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"
import { Slot } from "@radix-ui/react-slot"

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "black" | "sage"
  size?: "default" | "sm" | "lg" | "icon"
  asChild?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-none font-sans font-bold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-sage disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-brand-dark text-white hover:bg-brand-dark/90": variant === "primary",
            "bg-brand-sage text-brand-dark hover:bg-brand-sage/80": variant === "secondary",
            "bg-brand-sage text-brand-dark": variant === "sage",
            "bg-brand-black text-white hover:bg-black/90": variant === "black",
            "border-2 border-brand-dark bg-transparent text-brand-dark hover:bg-brand-dark hover:text-white": variant === "outline",
            "hover:bg-brand-sage/20 text-brand-dark": variant === "ghost",
            "h-12 px-8 py-3 text-sm": size === "default",
            "h-10 px-4 text-xs": size === "sm",
            "h-14 px-10 text-base": size === "lg",
            "h-12 w-12": size === "icon",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
