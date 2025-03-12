"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Volume2, Pause, Loader2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface BrowserTTSProps {
  text: string
}

export function BrowserTTS({ text }: BrowserTTSProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSpeechSynthesisAvailable, setIsSpeechSynthesisAvailable] = useState(false)
  const isMountedRef = useRef(true)

  // Check if speech synthesis is available
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSpeechSynthesisAvailable(true)
    }

    return () => {
      isMountedRef.current = false
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const speakText = () => {
    if (!isSpeechSynthesisAvailable || !window.speechSynthesis) {
      setError("Speech synthesis not available")
      return false
    }

    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel()

      // Create a new utterance
      const utterance = new SpeechSynthesisUtterance(text)

      // Try to find a good voice
      const voices = window.speechSynthesis.getVoices()
      const preferredVoice = voices.find(
        (voice) => voice.name.includes("Female") || voice.name.includes("Google") || voice.name.includes("Samantha"),
      )

      if (preferredVoice) {
        utterance.voice = preferredVoice
      }

      utterance.rate = 0.9 // Slightly slower
      utterance.pitch = 1.0

      // Set up event handlers
      utterance.onend = () => {
        if (isMountedRef.current) {
          setIsPlaying(false)
        }
      }

      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event)
        if (isMountedRef.current) {
          setError("Speech synthesis failed")
          setIsPlaying(false)
        }
      }

      // Speak the text
      window.speechSynthesis.speak(utterance)
      return true
    } catch (error) {
      console.error("Error initializing speech:", error)
      setError("Failed to initialize speech")
      return false
    }
  }

  const toggleSpeech = () => {
    if (isPlaying) {
      // Stop speech
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
      setIsPlaying(false)
    } else {
      // Start speech
      setIsLoading(true)
      setError(null)

      // Small delay to ensure UI updates before speech starts
      setTimeout(() => {
        const success = speakText()
        if (success) {
          setIsPlaying(true)
        }
        setIsLoading(false)
      }, 100)
    }
  }

  // Don't render if speech synthesis is not available
  if (!isSpeechSynthesisAvailable) {
    return null
  }

  return (
    <div className="inline-flex items-center">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={toggleSpeech}
              disabled={isLoading}
              aria-label={isPlaying ? "Pause speech" : "Listen with browser TTS"}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isPlaying ? "Pause" : "Browser TTS (Fallback)"}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

