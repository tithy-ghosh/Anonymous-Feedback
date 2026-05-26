"use client"

import { type Session } from "next-auth"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Globe, ToggleLeft, ToggleRight, Copy, Check, Sun, Moon, Monitor, LogOut, Loader2, MessageCircle } from "lucide-react"
import { Button, Avatar } from "@/components/ui"
import { LogoFull } from "@/components/ui/logo"
import { cn } from "@/lib/utils"

interface SidebarLink {
  href: string
  label: string
  icon: typeof LayoutDashboard
}

const links: SidebarLink[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/u", label: "Public Profile", icon: Globe },
]

interface SidebarProps {
  session: Session | null
  sidebarOpen: boolean
  onClose: () => void
  isAccepting: boolean
  toggling: boolean
  onToggleAccept: () => void
  copied: boolean
  onCopyLink: () => void
  theme: "dark" | "light" | "system"
  onCycleTheme: () => void
  onSignOut: () => void
}

export function Sidebar({
  session,
  sidebarOpen,
  onClose,
  isAccepting,
  toggling,
  onToggleAccept,
  copied,
  onCopyLink,
  theme,
  onCycleTheme,
  onSignOut,
}: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card transition-transform duration-300 lg:static lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="relative flex h-16 items-center gap-3 border-b border-border px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent" />
        <LogoFull showTagline />
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {links.map((link) => {
          const isActive =
            link.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith("/u/")
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-primary/10 to-transparent text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200",
                isActive ? "bg-primary/10" : "bg-transparent"
              )}>
                <link.icon className="h-4 w-4" />
              </div>
              {link.label}
            </Link>
          )
        })}

        <div className="my-4 border-t border-border" />

        <div className="space-y-1 px-1">
          <p className="px-2 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Settings
          </p>
          <button
            onClick={onToggleAccept}
            disabled={toggling}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-accent"
          >
            <span className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                <MessageCircle className={cn("h-4 w-4", isAccepting ? "text-primary" : "text-muted-foreground")} />
              </div>
              <span className="text-muted-foreground">Accept messages</span>
            </span>
            {toggling ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isAccepting ? (
              <ToggleRight className="h-5 w-5 text-primary" />
            ) : (
              <ToggleLeft className="h-5 w-5 text-muted-foreground" />
            )}
          </button>

          <button
            onClick={onCopyLink}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-accent"
          >
            <span className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                <Copy className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="text-muted-foreground">Copy profile link</span>
            </span>
            {copied ? (
              <Check className="h-4 w-4 text-emerald-500" />
            ) : (
              <Copy className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
            )}
          </button>

          <button
            onClick={onCycleTheme}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-accent"
          >
            <span className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                {theme === "dark" ? (
                  <Moon className="h-4 w-4 text-amber-500" />
                ) : theme === "light" ? (
                  <Sun className="h-4 w-4 text-primary" />
                ) : (
                  <Monitor className="h-4 w-4 text-primary" />
                )}
              </div>
              <span className="text-muted-foreground">Theme</span>
            </span>
            <span className="text-xs text-muted-foreground capitalize">
              {theme}
            </span>
          </button>
        </div>
      </nav>

      <div className="border-t border-border bg-gradient-to-b from-transparent to-primary/[0.02] p-4">
        <div className="flex items-center gap-3 rounded-xl px-3 py-2">
          <Avatar
            size="sm"
            fallback={session?.user?.username?.charAt(0) || "?"}
            alt={session?.user?.username || ""}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {session?.user?.username || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {session?.user?.email || ""}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
          onClick={onSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </aside>
  )
}
