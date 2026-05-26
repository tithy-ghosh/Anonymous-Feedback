"use client"

import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <h2 className="text-xl font-bold">Something went wrong</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {error.message || "An unexpected error occurred"}
      </p>
      <Button variant="gradient" size="sm" className="mt-4" onClick={reset}>
        Try again
      </Button>
    </div>
  )
}
