import Link from "next/link"
import { Sparkles } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/25">
        <Sparkles className="h-8 w-8 text-white" />
      </div>
      <h1 className="text-6xl font-bold tracking-tight">404</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        This page doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:brightness-110"
      >
        Go home
      </Link>
    </div>
  )
}
