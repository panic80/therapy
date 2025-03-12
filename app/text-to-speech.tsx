"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Volume2, Pause, Play, Loader2, AlertCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TextToSpeechProps {
  text: string
  therapist?: string
}

export function TextToSpeech({ text, therapist }: TextToSpeechProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioUrlRef = useRef<string | null>(null)
  const isMountedRef = useRef(true)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // For debugging
  useEffect(() => {
    console.log("State changed:", { isPlaying, isPaused, isLoading, error })
  }, [isPlaying, isPaused, isLoading, error])

  const MAX_RETRIES = 1
  const RETRY_DELAY = 1000 // 1 second

  // Clean up function
  useEffect(() => {
    return () => {
      isMountedRef.current = false

      // Clean up audio element
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }

      // Revoke object URL to prevent memory leaks
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current)
        audioUrlRef.current = null
      }
    }
  }, [])

  // Add keyboard shortcut for play/pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle space if the button is focused
      if (e.code === "Space" && document.activeElement === buttonRef.current) {
        e.preventDefault() // Prevent scrolling
        handleTextToSpeech()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isPlaying, isPaused])

  // Prepare a shorter version of text for TTS if it's too long
  const getOptimizedText = () => {
    // If text is very long, use only the first few paragraphs
    if (text.length > 3000) {
      const paragraphs = text.split("\n\n")
      let optimizedText = ""

      // Take first paragraphs up to about 3000 characters
      for (let i = 0; i < paragraphs.length && optimizedText.length < 3000; i++) {
        optimizedText += paragraphs[i] + "\n\n"
      }

      return optimizedText.trim() + "..."
    }

    return text
  }

  const pauseAudio = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
      setIsPaused(true)
      console.log("Audio paused")
      return true
    }
    return false
  }

  const resumeAudio = async () => {
    if (audioRef.current && isPaused && audioRef.current.src) {
      try {
        setIsLoading(true) // Set loading state while we try to play
        await audioRef.current.play()
        setIsPlaying(true)
        setIsPaused(false)
        console.log("Audio resumed")
        return true
      } catch (playError) {
        console.error("Error playing audio:", playError)
        setError("Failed to play audio")
        return false
      } finally {
        setIsLoading(false) // Make sure to clear loading state
      }
    }
    return false
  }

  const handleTextToSpeech = async () => {
    console.log("handleTextToSpeech called", { isPlaying, isPaused })
    
    // If already playing, pause it
    if (audioRef.current && isPlaying) {
      pauseAudio()
      return
    }

    // If we have audio loaded but paused, resume it
    if (audioRef.current && isPaused && audioRef.current.src) {
      await resumeAudio()
      return
    }

    // Otherwise, fetch new audio
    setIsLoading(true)
    setError(null)
    setIsPaused(false)
    setIsPlaying(false) // Make sure playing is false during loading

    try {
      // Get optimized text for TTS
      const optimizedText = getOptimizedText()

      // Clean text further to remove problematic characters
      const cleanedText = optimizedText
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Remove control characters
        .replace(/[\u2028\u2029]/g, " ") // Replace line/paragraph separators with spaces
        .replace(/\s+/g, " ") // Normalize whitespace
        .trim()

      console.log("Sending TTS request, text length:", cleanedText.length)

      const response = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          text: cleanedText,
          therapist: therapist 
        }),
      })

      // Check if the response is OK
      if (!response.ok) {
        // Try to parse error as JSON, but handle non-JSON responses too
        let errorMessage = "Failed to convert text to speech"
        let errorDetails = {}

        try {
          const contentType = response.headers.get("Content-Type") || ""
          if (contentType.includes("application/json")) {
            const errorData = await response.json()
            errorMessage = errorData.error || errorMessage
            errorDetails = errorData.details || {}
          } else {
            const errorText = await response.text()
            errorMessage = errorText || errorMessage
          }
        } catch (parseError) {
          console.error("Error parsing error response:", parseError)
          // If all else fails, use status text
          errorMessage = response.statusText || errorMessage
        }

        console.error("Text-to-speech API error:", errorMessage, errorDetails)

        // If we haven't exceeded max retries and it's a 5xx error (server error),
        // we can retry the request
        if (retryCount < MAX_RETRIES && response.status >= 500 && response.status < 600) {
          console.log(`Retrying TTS request (${retryCount + 1}/${MAX_RETRIES})...`)
          setRetryCount((prev) => prev + 1)

          // Wait a bit before retrying
          if (isMountedRef.current) {
            setIsLoading(false)
            setTimeout(() => {
              if (isMountedRef.current) {
                handleTextToSpeech()
              }
            }, RETRY_DELAY)
          }
          return
        }

        throw new Error(errorMessage)
      }

      // Reset retry count on success
      setRetryCount(0)

      // Get the audio blob - we expect binary data
      const audioBlob = await response.blob()

      // Revoke previous URL if it exists
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current)
      }

      // Create new URL
      const audioUrl = URL.createObjectURL(audioBlob)
      audioUrlRef.current = audioUrl

      // Create or update audio element
      if (!audioRef.current) {
        audioRef.current = new Audio()

        // Add event listeners
        audioRef.current.addEventListener("ended", () => {
          if (isMountedRef.current) {
            console.log("Audio ended")
            setIsPlaying(false)
            setIsPaused(false)
          }
        })

        audioRef.current.addEventListener("error", (e) => {
          console.error("Audio playback error:", e)
          if (isMountedRef.current) {
            setError("Failed to play audio")
            setIsPlaying(false)
            setIsPaused(false)
          }
        })

        audioRef.current.addEventListener("play", () => {
          console.log("Audio started playing")
          if (isMountedRef.current) {
            setIsPlaying(true)
            setIsPaused(false)
            setIsLoading(false) // Make sure to clear loading state when play starts
          }
        })

        audioRef.current.addEventListener("pause", () => {
          console.log("Audio was paused")
          if (isMountedRef.current && !audioRef.current?.ended) {
            setIsPlaying(false)
            setIsPaused(true)
          }
        })
      }

      // Set the source and load the audio
      audioRef.current.src = audioUrl
      await audioRef.current.load()

      // First clear loading state explicitly to prevent UI glitches
      setIsLoading(false)
      
      // Then attempt to play the audio
      try {
        await audioRef.current.play()
        console.log("Audio is now playing")
        setIsPlaying(true)
        setIsPaused(false)
      } catch (playError) {
        console.error("Error playing audio:", playError)
        setError("Failed to play audio")
        setIsPlaying(false)
        setIsPaused(false)
      }
    } catch (error) {
      console.error("Text-to-speech error:", error)
      if (isMountedRef.current) {
        setError(error instanceof Error ? error.message : "Failed to convert text to speech")
        setIsPlaying(false)
        setIsPaused(false)
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false) // Make absolutely sure loading state is cleared
      }
    }
  }

  // Function to render the button icon - simplified logic for clarity
  const buttonIcon = () => {
    console.log("Rendering button icon with state:", { isLoading, isPlaying, isPaused })
    
    if (isLoading) {
      return <Loader2 className="h-4 w-4 animate-spin" />
    }
    
    if (isPlaying) {
      return <Pause className="h-4 w-4" />
    }
    
    if (isPaused) {
      return <Play className="h-4 w-4" />
    }
    
    if (error) {
      return <AlertCircle className="h-4 w-4 text-red-500" />
    }
    
    return <Volume2 className="h-4 w-4" />
  }

  // Function to get tooltip text
  const tooltipText = () => {
    if (isLoading) return "Loading..."
    if (error) return "Error: Try again"
    if (isPlaying) return "Pause"
    if (isPaused) return "Resume"
    return "Listen"
  }

  // Button's aria-label
  const buttonAriaLabel = isPlaying 
    ? "Pause speech" 
    : isPaused 
      ? "Resume speech" 
      : "Listen to response"

  return (
    <div className="inline-flex items-center">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              ref={buttonRef}
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${isPaused ? 'bg-muted/50' : ''} ${isPlaying ? 'bg-primary/10' : ''}`}
              onClick={handleTextToSpeech}
              disabled={isLoading}
              aria-label={buttonAriaLabel}
              data-state-playing={isPlaying}
              data-state-paused={isPaused}
              data-state-loading={isLoading}
            >
              {buttonIcon()}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {tooltipText()}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {error && <span className="text-xs text-red-500 ml-2">Error</span>}
    </div>
  )
}

