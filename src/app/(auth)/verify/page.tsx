"use client"

import { Suspense, useState, useRef, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, ShieldCheck, ArrowRight, RefreshCw, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useToastActions } from "@/components/ui/toast"

const OTP_LENGTH = 6
const RESEND_COOLDOWN = 30

function VerifyForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const toast = useToastActions()
  const username = searchParams.get("username") || ""

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""))
  const [activeIndex, setActiveIndex] = useState(0)
  const [error, setError] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN)
  const canResend = countdown <= 0

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (!username) {
      router.push("/sign-up")
    }
  }, [username, router])

  useEffect(() => {
    inputRefs.current[activeIndex]?.focus()
  }, [activeIndex])

  useEffect(() => {
    if (canResend) return
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [canResend])

  const handleChange = useCallback(
    (index: number, value: string) => {
      if (!/^\d*$/.test(value)) return
      setError("")

      const newOtp = [...otp]
      newOtp[index] = value.slice(-1)
      setOtp(newOtp)

      if (value && index < OTP_LENGTH - 1) {
        setActiveIndex(index + 1)
      }
    },
    [otp]
  )

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !otp[index] && index > 0) {
        setActiveIndex(index - 1)
      }
      if (e.key === "ArrowLeft" && index > 0) {
        setActiveIndex(index - 1)
      }
      if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
        setActiveIndex(index + 1)
      }
    },
    [otp]
  )

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH)
    if (!pasted) return
    const newOtp = Array(OTP_LENGTH).fill("")
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i]
    }
    setOtp(newOtp)
    setActiveIndex(Math.min(pasted.length, OTP_LENGTH - 1))
    setError("")
  }, [])

  const handleVerify = async () => {
    const code = otp.join("")
    if (code.length !== OTP_LENGTH) {
      setError("Please enter all 6 digits")
      return
    }
    setIsVerifying(true)
    setError("")

    try {
      const res = await fetch("/api/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, code }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Email verified!", "You can now sign in to your account.")
        router.push("/sign-in")
      } else {
        setError(data.message || "Invalid verification code")
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    setIsResending(true)
    try {
      const res = await fetch("/api/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success("New code sent!", "Check your email inbox.")
        setCountdown(RESEND_COOLDOWN)
        setOtp(Array(OTP_LENGTH).fill(""))
        setActiveIndex(0)
        setError("")
      } else {
        toast.error(data.message || "Failed to resend code")
      }
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setIsResending(false)
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
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm"
        >
          <ShieldCheck className="h-7 w-7" />
        </motion.div>
        <h1 className="text-2xl font-bold tracking-tight">Verify your email</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          We sent a 6-digit code to your email
        </p>
      </div>

      <Card padding="lg" className="border-border/60">
        <CardContent className="space-y-6 p-0">
          <div className="flex items-center justify-center gap-2 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span className="font-medium text-foreground">{username}</span>
          </div>

          <div className="flex justify-center gap-2 sm:gap-3">
            {otp.map((digit, index) => (
              <motion.div
                key={index}
                animate={activeIndex === index ? { scale: 1.08 } : { scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <input
                  ref={(el) => { inputRefs.current[index] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  onFocus={() => setActiveIndex(index)}
                  className={`flex h-12 w-10 items-center justify-center rounded-xl border text-center text-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:h-14 sm:w-12
                    ${
                      error
                        ? "border-destructive bg-destructive/5 focus:ring-destructive"
                        : digit
                          ? "border-primary bg-primary/5 focus:ring-primary shadow-sm"
                          : "border-input bg-transparent focus:border-primary focus:ring-primary"
                    }`}
                />
              </motion.div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
              >
                <AlertCircle className="h-4 w-4" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            variant="gradient"
            size="lg"
            className="w-full"
            onClick={handleVerify}
            loading={isVerifying}
            disabled={otp.some((d) => !d) || isVerifying}
          >
            {isVerifying ? "Verifying..." : "Verify email"}
            {!isVerifying && <ArrowRight className="h-4 w-4" />}
          </Button>
        </CardContent>

        <CardFooter className="mt-6 flex-col gap-2 p-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Didn&apos;t receive the code?</span>
            {canResend ? (
              <button
                onClick={handleResend}
                disabled={isResending}
                className="flex items-center gap-1 font-medium text-primary transition-colors hover:text-primary/80 disabled:opacity-50"
              >
                {isResending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}
                Resend
              </button>
            ) : (
              <span className="text-muted-foreground">
                Resend in <span className="font-medium text-foreground">{countdown}s</span>
              </span>
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <VerifyForm />
    </Suspense>
  )
}
