"use client"

import { forwardRef, type InputHTMLAttributes } from "react"
import { motion } from "framer-motion"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full rounded-lg border bg-transparent px-3 py-2.5 text-sm ring-offset-background transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-input hover:border-primary/50",
        glass: "border-glass-border bg-glass backdrop-blur-xl hover:border-primary/50",
        ghost: "border-transparent bg-muted/50 hover:bg-muted focus-visible:bg-background",
      },
      state: {
        default: "",
        error: "border-destructive focus-visible:ring-destructive",
        success: "border-emerald-500 focus-visible:ring-emerald-500",
      },
    },
    defaultVariants: {
      variant: "default",
      state: "default",
    },
  }
)

export interface InputProps
  extends InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  icon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, state, icon, type, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
            {icon}
          </div>
        )}
        <motion.input
          whileFocus={{ scale: 1.01 }}
          transition={{ duration: 0.15 }}
          type={type}
          className={cn(
            inputVariants({ variant, state, className }),
            icon && "pl-10"
          )}
          ref={ref}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          {...(props as any)}
        />
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
