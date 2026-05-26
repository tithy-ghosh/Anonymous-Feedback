"use client"

import { motion } from "framer-motion"
import { Trash2, MessageCircle, Clock, Sparkles } from "lucide-react"
import { Card, CardContent, Button } from "@/components/ui"

interface MessageCardProps {
  content: string
  createdAt: string
  onDelete?: () => void
  index?: number
}

const colorPairs = [
  { bg: "bg-teal-500/10", icon: "text-teal-500", border: "hover:border-teal-500/30" },
  { bg: "bg-cyan-500/10", icon: "text-cyan-500", border: "hover:border-cyan-500/30" },
  { bg: "bg-emerald-500/10", icon: "text-emerald-500", border: "hover:border-emerald-500/30" },
  { bg: "bg-sky-500/10", icon: "text-sky-500", border: "hover:border-sky-500/30" },
  { bg: "bg-amber-500/10", icon: "text-amber-500", border: "hover:border-amber-500/30" },
]

export function MessageCard({ content, createdAt, onDelete, index = 0 }: MessageCardProps) {
  const date = new Date(createdAt)
  const timeAgo = isNaN(date.getTime()) ? "Unknown time" : getTimeAgo(date)
  const colors = colorPairs[index % colorPairs.length]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card
        variant="glass"
        padding="md"
        className={`group border-glass-border transition-all duration-300 ${colors.border}`}
      >
        <CardContent className="flex items-start gap-4 p-0">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colors.bg} ${colors.icon}`}
          >
            <MessageCircle className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm leading-relaxed">{content}</p>
            <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{timeAgo}</span>
              </div>
              <div className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                <span>Anonymous</span>
              </div>
            </div>
          </div>
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Delete message"
              className="shrink-0 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}
