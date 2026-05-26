"use client"

import { forwardRef, type HTMLAttributes, useState } from "react"
import Image from "next/image"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const avatarVariants = cva(
  "relative inline-flex items-center justify-center overflow-hidden rounded-full bg-muted select-none shrink-0",
  {
    variants: {
      size: {
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-12 w-12 text-base",
        xl: "h-16 w-16 text-xl",
        "2xl": "h-24 w-24 text-3xl",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

export interface AvatarProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  src?: string
  alt?: string
  fallback?: string
  status?: "online" | "offline" | "away"
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size, src, alt = "", fallback, status, ...props }, ref) => {
    const [imgError, setImgError] = useState(false)

    const showFallback = !src || imgError

    return (
      <div
        ref={ref}
        className={cn(avatarVariants({ size }), "relative", className)}
        {...props}
      >
        {!showFallback ? (
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            onError={() => setImgError(true)}
            unoptimized
          />
        ) : (
          <span className="font-medium text-muted-foreground">
            {fallback || alt?.charAt(0)?.toUpperCase() || "?"}
          </span>
        )}
        {status && (
          <span
            className={cn(
              "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background",
              status === "online" && "bg-emerald-500",
              status === "away" && "bg-amber-500",
              status === "offline" && "bg-muted-foreground"
            )}
          />
        )}
      </div>
    )
  }
)
Avatar.displayName = "Avatar"

export { Avatar, avatarVariants }
