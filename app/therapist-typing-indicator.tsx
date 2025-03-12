"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface TherapistTypingIndicatorProps {
  therapistAvatar?: string
  therapistName?: string
}

export function TherapistTypingIndicator({
  therapistAvatar = "/placeholder.svg?height=32&width=32",
  therapistName = "AI",
}: TherapistTypingIndicatorProps) {
  const [dots, setDots] = useState(".")

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "." : prev + "."))
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex justify-start">
      <Avatar className="h-8 w-8 mr-2">
        <AvatarImage src={therapistAvatar} alt={therapistName} />
        <AvatarFallback>{therapistName.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="rounded-lg px-4 py-2 bg-muted">
        <p className="text-sm">Thinking{dots}</p>
      </div>
    </div>
  )
}

