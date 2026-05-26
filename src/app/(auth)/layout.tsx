"use client"

import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { LogoMark } from "@/components/ui/logo"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-b from-background via-background to-primary/5">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-weave opacity-[0.04] dark:opacity-[0.06]" />
        <div className="absolute left-[20%] top-[15%] h-48 w-48 rounded-full border border-primary/10 bg-primary/[0.03]" />
        <div className="absolute right-[22%] top-[55%] h-32 w-32 rounded-full border border-cyan-500/10 bg-cyan-500/[0.03]" />
        <div className="absolute left-[35%] bottom-[10%] h-24 w-24 rounded-full border border-teal-500/10 bg-teal-500/[0.03]" />
        <div className="absolute left-[30%] top-[40%] h-px w-36 bg-gradient-to-r from-transparent via-primary/12 to-transparent" />
        <div className="absolute left-1/2 top-0 h-[50%] w-[70%] -translate-x-1/2 bg-gradient-to-b from-primary/[0.03] to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl items-center px-4 py-6">
        <Link href="/" className="flex items-center gap-2">
          <LogoMark size="sm" />
          <span className="text-sm font-bold">Mystry Message</span>
        </Link>
      </div>

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 pb-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
