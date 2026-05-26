"use client"

import { Menu } from "lucide-react"
import { Avatar } from "@/components/ui"
import { LogoFull } from "@/components/ui/logo"

interface HeaderProps {
  username?: string
  onMenuClick: () => void
}

export function Header({ username, onMenuClick }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-8 ">
      <button
        onClick={onMenuClick}
        className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <LogoFull size="sm" showTagline={false} className="lg:hidden" />
      <div className="flex-1 lg:hidden" />
      <LogoFull size="sm" showTagline={false} className="hidden lg:flex" />
      <Avatar
        size="sm"
        fallback={username?.charAt(0) || "?"}
        alt={username || ""}
        className="ring-2 ring-border lg:hidden"
      />
    </header>
  )
}
