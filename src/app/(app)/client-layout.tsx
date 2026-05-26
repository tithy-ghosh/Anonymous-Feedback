"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2 } from "lucide-react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { useToastActions } from "@/components/ui/toast"
import { useTheme } from "@/components/theme-provider"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const toast = useToastActions()
  const { theme, resolved, cycleTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isAccepting, setIsAccepting] = useState(true)
  const [toggling, setToggling] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in")
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.username) {
      fetch("/api/accept-messages")
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setIsAccepting(d.isAcceptingMessages)
        })
        .catch(() => {})
    }
  }, [session])

  const toggleAcceptMessages = async () => {
    setToggling(true)
    const newVal = !isAccepting
    try {
      const res = await fetch("/api/accept-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acceptMessages: newVal }),
      })
      const data = await res.json()
      if (data.success) {
        setIsAccepting(newVal)
        toast.success(newVal ? "Now accepting messages" : "Messages paused")
      }
    } catch {
      toast.error("Failed to update settings")
    } finally {
      setToggling(false)
    }
  }

  const copyProfileLink = () => {
    if (!session?.user?.username) return
    const link = `${window.location.origin}/u/${session.user.username}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    toast.success("Link copied!", "Share this to receive anonymous messages.")
    setTimeout(() => setCopied(false), 2000)
  }

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <Sidebar
        session={session}
        sidebarOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isAccepting={isAccepting}
        toggling={toggling}
        onToggleAccept={toggleAcceptMessages}
        copied={copied}
        onCopyLink={copyProfileLink}
        theme={theme}
        onCycleTheme={cycleTheme}
        onSignOut={() => signOut({ callbackUrl: "/" })}
      />

      <div className="flex flex-1 flex-col min-w-0">
        <Header
          username={session?.user?.username}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
