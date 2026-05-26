"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import {
  Inbox,
  Copy,
  Check,
  ExternalLink,
  Calendar,
  Search,
  BarChart3,
  Sparkles,
  TrendingUp,
  Clock,
  MessageCircle,
} from "lucide-react"
import Link from "next/link"
import { MessageCard } from "@/components/message-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCardSkeleton } from "@/components/ui/skeleton"
import { useToastActions } from "@/components/ui/toast"
import confetti from "canvas-confetti"

interface Message {
  _id: string
  content: string
  createdAt: string
}

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

function StatsCard({
  icon: Icon,
  label,
  value,
  gradient,
}: {
  icon: typeof BarChart3
  label: string
  value: string | number
  gradient: string
}) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const numValue = typeof value === "number" ? value : parseInt(value as string) || 0
    let start = 0
    const duration = 1200
    const step = Math.max(1, Math.floor(numValue / 30))
    const timer = setInterval(() => {
      start += step
      if (start >= numValue) {
        setDisplayValue(numValue)
        clearInterval(timer)
      } else {
        setDisplayValue(start)
      }
    }, duration / (numValue / step || 1))
    return () => clearInterval(timer)
  }, [value])

  return (
    <motion.div
      variants={item}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card p-3 sm:p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="absolute inset-0 bg-gradient-to-br opacity-[0.03] transition-opacity duration-300 group-hover:opacity-[0.06]" />
      <div className="relative flex flex-col gap-2">
        <div className="flex items-center justify-between gap-1">
          <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-muted-foreground leading-tight">
            {label}
          </p>
          <div className="flex h-7 w-7 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
          </div>
        </div>
        <p className="text-2xl sm:text-3xl font-bold tracking-tight tabular-nums">
          {displayValue}
        </p>
      </div>
      <div className={`absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r ${gradient} transition-all duration-500 group-hover:w-full`} />
    </motion.div>
  )
}

function ProfileLinkCard({
  profileUrl,
  onCopy,
  copied,
}: {
  profileUrl: string
  onCopy: () => void
  copied: boolean
}) {
  return (
    <motion.div variants={item}>
      <div className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-transparent to-cyan-500/5 p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
        <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/10 blur-3xl transition-all duration-500 group-hover:scale-150" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ExternalLink className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Your public profile</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Share this link to receive anonymous messages
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Button
                variant="gradient"
                size="sm"
                onClick={onCopy}
                className="relative"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? "Copied!" : "Copy link"}
              </Button>
            </div>
            <Link href={profileUrl}>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4" />
                View
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function EmptyState({
  search,
  onCopy,
}: {
  search: string
  onCopy: () => void
}) {
  return (
    <motion.div variants={item}>
      <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-border py-20 text-center transition-all duration-300 hover:border-primary/30">
        <div className="absolute inset-0 bg-dot opacity-[0.03]" />
        <div className="relative">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10"
          >
            {search ? (
              <Search className="h-10 w-10 text-muted-foreground" />
            ) : (
              <Sparkles className="h-10 w-10 text-primary" />
            )}
          </motion.div>
          <h3 className="text-xl font-semibold">
            {search ? "No messages match your search" : "No messages yet"}
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            {search
              ? "Try a different search term or clear the filter."
              : "Share your profile link with friends to start receiving anonymous messages."}
          </p>
          {!search && (
            <div className="mt-8 flex justify-center">
              <Button
                variant="gradient"
                onClick={onCopy}
                className="group"
              >
                <Copy className="h-4 w-4 transition-transform group-hover:scale-110" />
                Copy your profile link
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const toast = useToastActions()
  const toastRef = useRef(toast)

  useEffect(() => {
    toastRef.current = toast
  }, [toast])
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [, setDeletingId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [search, setSearch] = useState("")
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/get-messages")
        const data = await res.json()
        if (!cancelled && data.success) {
          setMessages(data.message || [])
        }
      } catch {
        if (!cancelled) toastRef.current.error("Failed to load messages")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return messages
    const q = search.toLowerCase()
    return messages.filter((m) => m.content.toLowerCase().includes(q))
  }, [messages, search])

  const stats = useMemo(() => {
    const total = messages.length
    const today = messages.filter((m) => {
      const d = new Date(m.createdAt)
      const now = new Date()
      return d.toDateString() === now.toDateString()
    }).length
    const thisWeek = messages.filter((m) => {
      const d = new Date(m.createdAt)
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return d >= weekAgo
    }).length
    return { total, today, thisWeek }
  }, [messages])

  const deleteMessage = async (id: string) => {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/delete-message`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: id }),
      })
      const data = await res.json()
      if (data.success) {
        setMessages((prev) => prev.filter((m) => m._id !== id))
        toast.success("Message deleted")
      } else {
        toast.error("Failed to delete message")
      }
    } catch {
      toast.error("Network error")
    } finally {
      setDeletingId(null)
    }
  }

  const copyProfileLink = () => {
    if (!session?.user?.username) return
    const link = `${window.location.origin}/u/${session.user.username}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    confetti({
      particleCount: 80,
      spread: 100,
      origin: { y: 0.5 },
      colors: ["#14b8a6", "#06b6d4", "#10b981", "#f59e0b"],
    })
    setTimeout(() => setCopied(false), 2000)
    toast.success("Profile link copied!")
  }

  const profileUrl = session?.user?.username
    ? `/u/${session.user.username}`
    : "#"

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-4xl space-y-6 sm:space-y-8"
    >
      <motion.div variants={item} className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              Dashboard
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Manage messages sent to you
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <StatsCard
          icon={Inbox}
          label="Total messages"
          value={stats.total}
          gradient="from-teal-500 to-cyan-500"
        />
        <StatsCard
          icon={Calendar}
          label="Received today"
          value={stats.today}
          gradient="from-cyan-500 to-sky-500"
        />
        <StatsCard
          icon={TrendingUp}
          label="This week"
          value={stats.thisWeek}
          gradient="from-emerald-500 to-teal-500"
        />
      </div>

      <ProfileLinkCard profileUrl={profileUrl} onCopy={copyProfileLink} copied={copied} />

      {loading ? (
        <motion.div variants={item} className="space-y-3">
          <div className="flex items-center gap-3 px-1">
            <Clock className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Loading messages...</span>
          </div>
          <MessageCardSkeleton />
          <MessageCardSkeleton />
          <MessageCardSkeleton />
          <MessageCardSkeleton />
        </motion.div>
      ) : (
        <>
          {messages.length > 0 && (
            <motion.div variants={item}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  ref={searchRef}
                  placeholder="Search messages..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                  variant="glass"
                />
              </div>
            </motion.div>
          )}

          {filtered.length === 0 ? (
            <EmptyState search={search} onCopy={copyProfileLink} />
          ) : (
            <motion.div variants={item} className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-primary" />
                  <p className="text-xs font-medium text-muted-foreground">
                    {filtered.length} message{filtered.length !== 1 ? "s" : ""}
                    {search && ` matching "${search}"`}
                  </p>
                </div>
                {search && (
                  <button
                    onClick={() => {
                      setSearch("")
                      searchRef.current?.focus()
                    }}
                    className="text-xs text-primary transition-colors hover:text-primary-light"
                  >
                    Clear filter
                  </button>
                )}
              </div>
              {filtered.map((msg, i) => (
                <motion.div
                  key={msg._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <MessageCard
                    content={msg.content}
                    createdAt={msg.createdAt}
                    index={i}
                    onDelete={() => deleteMessage(msg._id)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  )
}
