"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { LogoMark } from "@/components/ui/logo"
import { useToastActions } from "@/components/ui/toast"

const usernameSchema = /^[a-zA-Z0-9_]+$/

export default function SignUpPage() {
  const router = useRouter()
  const toast = useToastActions()
  const [form, setForm] = useState({ username: "", email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const checkUsername = useCallback(async (username: string) => {
    if (username.length < 3) {
      setUsernameStatus("idle")
      return
    }
    setUsernameStatus("checking")
    try {
      const res = await fetch(`/api/check-username-unique?username=${encodeURIComponent(username)}`)
      const data = await res.json()
      setUsernameStatus(data.success ? "available" : "taken")
    } catch {
      setUsernameStatus("idle")
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (form.username) {
      debounceRef.current = setTimeout(() => checkUsername(form.username), 400)
    }
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [form.username, checkUsername])

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "username":
        if (value.length < 3) return "Username must be at least 3 characters"
        if (value.length > 20) return "Username must be no longer than 20 characters"
        if (!usernameSchema.test(value)) return "Only letters, numbers, and underscores allowed"
        return ""
      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email"
        return ""
      case "password":
        if (value.length < 6) return "Password must be at least 6 characters"
        return ""
      default:
        return ""
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    const error = validateField(name, value)
    setErrors((prev) => ({ ...prev, [name]: error }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // If still checking, wait — don't block with a misleading error
    if (usernameStatus === "checking") {
      toast.info("Still checking username, please wait a moment...")
      return
    }

    if (usernameStatus === "taken") {
      toast.error("That username is already taken. Please choose another.")
      return
    }

    const newErrors: Record<string, string> = {}
    for (const key of ["username", "email", "password"] as const) {
      const err = validateField(key, form[key])
      if (err) newErrors[key] = err
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Account created!", "Check your email for the verification code.")
        router.push(`/verify?username=${encodeURIComponent(form.username)}`)
      } else {
        toast.error(data.message || "Something went wrong")
      }
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-md"
    >
      <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="mx-auto mb-4"
          >
            <LogoMark size="lg" />
          </motion.div>
        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Join Mystry Message and start receiving anonymous messages
        </p>
      </div>

      <Card padding="lg" className="border-border/60">
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5 p-0">
            <div className="space-y-2">
              <Label htmlFor="username" required>
                Username
              </Label>
              <div className="relative">
                <Input
                  id="username"
                  name="username"
                  placeholder="your_username"
                  value={form.username}
                  onChange={handleChange}
                  state={errors.username ? "error" : usernameStatus === "available" ? "success" : "default"}
                  variant="glass"
                  icon={<User className="h-4 w-4" />}
                  maxLength={20}
                  autoComplete="off"
                />
                <AnimatePresence>
                  {form.username.length >= 3 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {usernameStatus === "checking" ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : usernameStatus === "available" ? (
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      ) : usernameStatus === "taken" ? (
                        <XCircle className="h-4 w-4 text-destructive" />
                      ) : null}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <AnimatePresence mode="wait">
                {errors.username && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-xs text-destructive"
                  >
                    {errors.username}
                  </motion.p>
                )}
                {!errors.username && usernameStatus === "available" && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-xs text-emerald-500"
                  >
                    Username is available
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" required>
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                state={errors.email ? "error" : "default"}
                variant="glass"
                icon={<Mail className="h-4 w-4" />}
                autoComplete="email"
              />
              <AnimatePresence>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-xs text-destructive"
                  >
                    {errors.email}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" required>
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={handleChange}
                  state={errors.password ? "error" : "default"}
                  variant="glass"
                  icon={<Lock className="h-4 w-4" />}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-xs text-destructive"
                  >
                    {errors.password}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </CardContent>

          <CardFooter className="mt-6 flex-col gap-3 p-0">
            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full"
              loading={isSubmitting}
              disabled={usernameStatus === "taken" || usernameStatus === "checking" || isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "Create account"}
              {!isSubmitting && <ArrowRight className="h-4 w-4" />}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="font-medium text-primary transition-colors hover:text-primary/80"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  )
}
