"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  ArrowRight,
  Shield,
  MessageCircle,
  Link2,
  Star,
  Quote,
  ChevronDown,
  Loader2,
  Send,
  Hash,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogoMark } from "@/components/ui/logo"

const features = [
  {
    icon: MessageCircle,
    title: "Anonymous Messages",
    desc: "Receive honest feedback without knowing who sent it.",
  },
  {
    icon: Shield,
    title: "Your Privacy First",
    desc: "We never reveal sender identities. Ever.",
  },
  {
    icon: Link2,
    title: "Shareable Profile",
    desc: "Get your unique link and share it anywhere.",
  },
]

const testimonials = [
  {
    quote: "I've received the most honest feedback I've ever gotten. It's eye-opening.",
    author: "Alex",
    role: "Content Creator",
  },
  {
    quote: "Finally a way to hear what people actually think without the awkwardness.",
    author: "Jordan",
    role: "Community Manager",
  },
  {
    quote: "Simple, private, and incredibly effective. My team loves it.",
    author: "Sam",
    role: "Team Lead",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

function BgGeometric() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-weave opacity-[0.04] dark:opacity-[0.06]" />
      <div className="absolute left-[15%] top-[18%] h-56 w-56 rounded-full border border-primary/10 bg-primary/[0.03]" />
      <div className="absolute right-[18%] top-[52%] h-36 w-36 rounded-full border border-cyan-500/10 bg-cyan-500/[0.03]" />
      <div className="absolute left-[38%] bottom-[12%] h-28 w-28 rounded-full border border-teal-500/10 bg-teal-500/[0.03]" />
      <div className="absolute left-[28%] top-[38%] h-px w-48 bg-gradient-to-r from-transparent via-primary/15 to-transparent" />
      <div className="absolute right-[22%] top-[42%] h-px w-40 bg-gradient-to-r from-transparent via-cyan-500/15 to-transparent" />
      <div className="absolute left-1/2 top-0 h-[55%] w-[75%] -translate-x-1/2 bg-gradient-to-b from-primary/[0.03] to-transparent" />
    </div>
  )
}

function AnimatedCounter({ value, label, icon: Icon }: { value: number; label: string; icon: typeof Star }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const end = value
    const duration = 2000
    const step = Math.max(1, Math.floor(end / 60))
    const timer = setInterval(() => {
      start += step
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(start)
      }
    }, duration / (end / step))
    return () => clearInterval(timer)
  }, [value])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/50 px-5 py-3"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <p className="text-xl font-bold tabular-nums">
          {count.toLocaleString()}+
        </p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </motion.div>
  )
}

export default function HomePage() {
  const router = useRouter()
  const [searchUsername, setSearchUsername] = useState("")
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = searchUsername.trim()
    if (!trimmed) {
      setSearchError("Enter a username")
      return
    }
    setSearchError("")
    setSearching(true)
    try {
      router.push(`/u/${encodeURIComponent(trimmed)}`)
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark size="sm" />
            <span className="text-base font-bold tracking-tight">Mystry Message</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button variant="gradient" size="sm">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pb-16 pt-24">
          <BgGeometric />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative z-10 mx-auto max-w-3xl text-center"
          >
            <motion.div variants={itemVariants}>
              <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary shadow-sm">
                <LogoMark size="xs" />
                Anonymous messaging, reimagined
              </div>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-7xl"
            >
              Speak your mind,{" "}
              <span className="bg-gradient-to-r from-teal-500 via-cyan-500 to-sky-500 bg-clip-text text-transparent">
                stay anonymous
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mx-auto mt-5 max-w-xl text-base text-muted-foreground leading-relaxed"
            >
              Create your profile, share your link, and let people send you
              anonymous messages. No sign-up required for senders.
            </motion.p>

            <motion.form
              variants={itemVariants}
              onSubmit={handleSearch}
              className="mt-8 mx-auto w-full max-w-lg"
            >
              <div className="relative flex items-center gap-2">
                <div className="relative flex-1">
                  <Hash className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                  <input
                    type="text"
                    value={searchUsername}
                    onChange={(e) => {
                      setSearchUsername(e.target.value)
                      if (searchError) setSearchError("")
                    }}
                    placeholder="Find someone by username..."
                    className="h-12 w-full rounded-xl border border-border/60 bg-card/80 pl-11 pr-4 text-sm shadow-sm backdrop-blur-sm transition-all duration-200 placeholder:text-muted-foreground/60 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15"
                  />
                </div>
                <Button
                  type="submit"
                  variant="gradient"
                  size="md"
                  disabled={searching}
                  className="h-12 shrink-0 gap-2"
                >
                  {searching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send
                    </>
                  )}
                </Button>
              </div>
              {searchError && (
                <p className="mt-2 text-xs text-destructive text-left">
                  {searchError}
                </p>
              )}
              <p className="mt-2 text-xs text-muted-foreground/70 text-left">
                Find any user and send them an anonymous message — no account needed
              </p>
            </motion.form>

            <motion.div variants={itemVariants} className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/sign-up" className="group relative">
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 opacity-40 blur transition duration-300 group-hover:opacity-60" />
                <Button variant="gradient" size="lg" className="relative w-full sm:w-auto">
                  Create your profile
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  I already have an account
                </Button>
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-14 flex flex-wrap items-center justify-center gap-3">
              <AnimatedCounter value={10000} label="Trusted users" icon={Star} />
              <AnimatedCounter value={50000} label="Messages sent" icon={MessageCircle} />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <ChevronDown className="h-5 w-5 animate-bounce text-muted-foreground/60" />
          </motion.div>
        </section>

        <section className="relative border-t border-border/60 px-4 py-24">
          <div className="absolute inset-0 bg-weave opacity-[0.04] dark:opacity-[0.06]" />
          <div className="absolute inset-0 bg-diagonal opacity-[0.02] dark:opacity-[0.03]" />
          <div className="mx-auto max-w-5xl relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className="mb-14 text-center"
            >
              <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-1 text-xs font-medium text-primary">
                How it works
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Three simple steps
              </h2>
              <p className="mt-2 text-muted-foreground max-w-lg mx-auto text-sm">
                Start receiving anonymous messages in minutes
              </p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-3">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  className="group relative"
                >
                  <div className="relative rounded-xl border border-border/60 bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 card-highlight">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <div className="mb-2 flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground">
                      {i + 1}
                    </div>
                    <h3 className="mb-1.5 text-base font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative border-t border-border/60 bg-muted/30 px-4 py-24">
          <div className="absolute inset-0 bg-weave opacity-[0.04] dark:opacity-[0.06]" />
          <div className="mx-auto max-w-5xl relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className="mb-14 text-center"
            >
              <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-1 text-xs font-medium text-primary">
                Testimonials
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Loved by users
              </h2>
              <p className="mt-2 text-muted-foreground max-w-lg mx-auto text-sm">
                Here&apos;s what people are saying about Mystry Message
              </p>
            </motion.div>

            <div className="grid gap-5 md:grid-cols-3">
              {testimonials.map((t, i) => (
                <motion.div
                  key={t.author}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <div className="relative flex h-full flex-col rounded-xl border border-border/60 bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 card-highlight">
                    <div className="mb-3 flex items-center gap-0.5">
                      {[...Array(5)].map((_, s) => (
                        <Star
                          key={s}
                          className="h-3.5 w-3.5 fill-amber-500 text-amber-500"
                        />
                      ))}
                    </div>
                    <Quote className="mb-2.5 h-5 w-5 text-primary/25" />
                    <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="mt-5 flex items-center gap-3 border-t border-border/50 pt-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary shadow-sm">
                        {t.author.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{t.author}</p>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative border-t border-border/60 px-4 py-24">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to get started?
              </h2>
              <p className="mt-3 text-muted-foreground max-w-lg mx-auto text-sm">
                Join thousands of users who are already receiving anonymous messages.
                It&apos;s free and takes less than a minute.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/sign-up" className="group relative">
                  <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 opacity-40 blur transition duration-300 group-hover:opacity-60" />
                  <Button variant="gradient" size="lg" className="relative">
                    Get started free
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </Link>
                <Link href="/sign-in">
                  <Button variant="outline" size="lg">
                    Sign in
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <LogoMark size="xs" />
            <span className="text-sm font-semibold tracking-tight">Mystry Message</span>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Mystry Message. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
