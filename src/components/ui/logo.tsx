"use client"

import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  size?: "xs" | "sm" | "md" | "lg"
}

const sizeMap = {
  xs: { container: "h-5 w-5", icon: "h-3 w-3" },
  sm: { container: "h-8 w-8", icon: "h-[18px] w-[18px]" },
  md: { container: "h-9 w-9", icon: "h-5 w-5" },
  lg: { container: "h-14 w-14", icon: "h-8 w-8" },
}

export function LogoMark({ className, size = "md" }: LogoProps) {
  const s = sizeMap[size]
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-sm shadow-teal-500/25",
        s.container,
        className
      )}
    >
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={s.icon}>
        <rect x="2" y="5" width="28" height="22" rx="5" stroke="white" strokeWidth="1.8" fill="none" />
        <path d="M2 10L16 19L30 10" stroke="white" strokeWidth="1.8" fill="none" strokeLinejoin="round" />
        <path
          d="M8 24L12 16L16 21L20 16L24 24"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.9"
        />
        <circle cx="23" cy="14" r="2" fill="white" opacity="0.5" />
      </svg>
    </div>
  )
}

export function LogoFull({ className, size = "md", showTagline = true }: LogoProps & { showTagline?: boolean }) {
  const s = sizeMap[size]
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark size={size} />
      <div>
        <p className={cn(
          "font-bold tracking-tight",
          size === "sm" ? "text-xs" : size === "lg" ? "text-lg" : "text-sm"
        )}>
          Mystry Message
        </p>
        {showTagline && (
          <p className={cn(
            "text-muted-foreground",
            size === "sm" ? "text-[10px]" : "text-xs"
          )}>
            Anonymous messaging
          </p>
        )}
      </div>
    </div>
  )
}
