"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import {
  Send,
  Loader2,
  Lightbulb,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Lock,
} from "lucide-react"
import confetti from "canvas-confetti"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useToastActions } from "@/components/ui/toast"

interface UserProfile {
  username: string
  isAcceptingMessages: boolean
}

export default function PublicProfilePage() {
  const params = useParams()
  const username = params.username as string
  const toast = useToastActions()

  const [, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [message, setMessage] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/user-profile?username=${encodeURIComponent(username)}`)
        const data = await res.json()
        if (cancelled) return
        if (data.success) {
          setProfile(data)
        } else {
          setNotFound(true)
        }
      } catch {
        if (!cancelled) setNotFound(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [username])

  const getSuggestions = useCallback(async (): Promise<string[]> => {
    const fallback = [
      "What's something you've always wanted to tell me?",
      "What's your favorite memory of us?",
      "If you could give me one piece of advice, what would it be?",
    ]
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const res = await fetch("/api/suggest-messages", {
        method: "POST",
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (!res.ok) return fallback
      const data = await res.json()
      if (data.success && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        return data.suggestions.slice(0, 3)
      }
      return fallback
    } catch {
      return fallback
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoadingSuggestions(true)
      const result = await getSuggestions()
      if (!cancelled) {
        setSuggestions(result)
        setLoadingSuggestions(false)
      }
    })()
    return () => { cancelled = true }
  }, [getSuggestions])

  const fetchSuggestions = useCallback(async () => {
    setLoadingSuggestions(true)
    const result = await getSuggestions()
    setSuggestions(result)
    setLoadingSuggestions(false)
  }, [getSuggestions])

  const handleSend = async () => {
    if (!message.trim() || message.length < 10) {
      toast.error("Message must be at least 10 characters")
      return
    }
    if (message.length > 300) {
      toast.error("Message must be under 300 characters")
      return
    }

    setSending(true)
    try {
      const res = await fetch("/api/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, content: message.trim() }),
      })
      const data = await res.json()
      if (data.success) {
        setSent(true)
        toast.success("Message sent anonymously!")
        confetti({
          particleCount: 100,
          spread: 120,
          origin: { y: 0.5 },
          colors: ["#0d9488", "#2dd4bf", "#06b6d4", "#10b981", "#f59e0b"],
        })
      } else {
        toast.error(data.message || "Failed to send message")
      }
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setSending(false)
    }
  }

  const charsLeft = 300 - message.length

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-primary/[0.02]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-primary/[0.02] p-4">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-destructive/20 to-destructive/10">
          <AlertCircle className="h-10 w-10 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold">User not found</h1>
        <p className="mt-2 text-muted-foreground">
          This profile doesn&apos;t exist or has been removed.
        </p>
      </div>
    )
  }

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background via-background to-primary/5 p-4"
      >
        <Card variant="glass" padding="lg" className="max-w-md border-glass-border text-center">
          <CardContent className="flex flex-col items-center p-0">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-500/10"
            >
              <CheckCircle className="h-10 w-10 text-emerald-500" />
            </motion.div>
            <h2 className="text-xl font-bold">Message sent!</h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-sm">
              Your anonymous message has been delivered to{" "}
              <span className="font-semibold text-foreground">@{username}</span>.
            </p>
            <Button
              variant="gradient"
              size="sm"
              className="mt-8"
              onClick={() => {
                setSent(false)
                setMessage("")
              }}
            >
              Send another message
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background via-background to-primary/5 p-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-weave opacity-[0.04] dark:opacity-[0.06]" />
        <div className="absolute left-[15%] top-[20%] h-40 w-40 rounded-full border border-primary/10 bg-primary/[0.03]" />
        <div className="absolute right-[20%] top-[50%] h-28 w-28 rounded-full border border-cyan-500/10 bg-cyan-500/[0.03]" />
        <div className="absolute left-[40%] bottom-[15%] h-20 w-20 rounded-full border border-teal-500/10 bg-teal-500/[0.03]" />
        <div className="absolute left-[25%] top-[45%] h-px w-32 bg-gradient-to-r from-transparent via-primary/12 to-transparent" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
            className="mb-5 flex justify-center"
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary shadow-xl">
              {username?.charAt(0).toUpperCase()}
            </div>
          </motion.div>
          <h1 className="text-2xl font-bold tracking-tight">
            Send a message to{" "}
            <span className="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
              @{username}
            </span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your identity will remain completely anonymous
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs text-primary shadow-sm">
            <Lock className="h-3 w-3" />
            Anonymous &bull; No sign-up required
          </div>
        </div>

        <Card variant="glass" padding="lg" className="border-glass-border">
          <CardContent className="space-y-5 p-0">
            <div className="space-y-2">
              <label className="text-sm font-medium">Your message</label>
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => {
                    if (e.target.value.length <= 300) setMessage(e.target.value)
                  }}
                  placeholder="Write something anonymous..."
                  rows={5}
                  className="w-full resize-none rounded-xl border border-input bg-transparent p-4 text-sm leading-relaxed transition-all duration-200 placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  maxLength={300}
                />
                <div className="mt-2 flex items-center justify-between">
                  <span
                    className={`text-xs font-medium ${
                      charsLeft < 20
                        ? "text-destructive"
                        : charsLeft < 50
                          ? "text-amber-500"
                          : "text-muted-foreground"
                    }`}
                  >
                    {charsLeft} characters left
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Min. 10 characters
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Lightbulb className="h-3.5 w-3.5 text-primary" />
                  <span>AI Suggestions</span>
                </div>
                <button
                  onClick={fetchSuggestions}
                  disabled={loadingSuggestions}
                  className="flex items-center gap-1 text-xs text-primary transition-colors hover:text-primary-light disabled:opacity-50"
                >
                  <RefreshCw className={`h-3 w-3 ${loadingSuggestions ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setMessage(s)}
                    className="flex items-start gap-1.5 rounded-xl border border-border bg-muted/50 px-3 py-2.5 text-left text-xs text-muted-foreground transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-foreground"
                  >
                    <Lightbulb className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                    <span>{s}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </CardContent>

          <CardFooter className="mt-6 p-0">
            <Button
              variant="gradient"
              size="lg"
              className="w-full group"
              onClick={handleSend}
              loading={sending}
              disabled={!message.trim() || message.length < 10 || sending}
            >
              {sending ? "Sending..." : "Send anonymously"}
              {!sending && <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
            </Button>
          </CardFooter>
        </Card>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center text-xs text-muted-foreground"
        >
          Powered by{" "}
          <span className="font-semibold text-foreground">Mystry Message</span>
        </motion.p>
      </motion.div>
    </div>
  )
}
