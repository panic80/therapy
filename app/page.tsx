"use client"

import { useRef, useEffect, useState } from "react"
import { useChat } from "@ai-sdk/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { TherapistTypingIndicator } from "./therapist-typing-indicator"
import { ExamplePrompts } from "./example-prompts"
import { TextToSpeech } from "./text-to-speech"
import { TherapistSelection, type TherapistType } from "./therapist-selection"

export default function TherapistChat() {
  const [selectedTherapist, setSelectedTherapist] = useState<TherapistType | null>(null)
  const [therapistInfo, setTherapistInfo] = useState({
    name: "AI Therapist",
    avatar: "/placeholder.svg?height=40&width=40",
    color: "bg-primary/5",
  })

  const { messages, input, handleInputChange, handleSubmit, isLoading, error, setInput } = useChat({
    api: "/api/chat",
    body: {
      therapist: selectedTherapist,
    },
    onError: (error) => {
      console.error("Chat error:", error)
    },
    id: selectedTherapist || undefined, // Create a new conversation when therapist changes
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showExamples, setShowExamples] = useState(true)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Hide examples after first message
  useEffect(() => {
    if (messages.length > 0) {
      setShowExamples(false)
    }
  }, [messages.length])

  // Update therapist info when selection changes
  useEffect(() => {
    if (selectedTherapist === "john") {
      setTherapistInfo({
        name: "Dr. John",
        avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&auto=format&fit=crop&q=80",
        color: "bg-blue-100",
      })
    } else if (selectedTherapist === "emma") {
      setTherapistInfo({
        name: "Dr. Emma",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&auto=format&fit=crop&q=80",
        color: "bg-purple-100",
      })
    } else if (selectedTherapist === "ethan") {
      setTherapistInfo({
        name: "Dr. Ethan",
        avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&h=150&auto=format&fit=crop&q=80",
        color: "bg-amber-100",
      })
    }
  }, [selectedTherapist])

  const handleExampleSelect = (prompt: string) => {
    setInput(prompt)
  }

  const handleTherapistSelect = (therapist: TherapistType) => {
    setSelectedTherapist(therapist)
  }

  if (!selectedTherapist) {
    return <TherapistSelection onSelect={handleTherapistSelect} />
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-3xl h-[80vh] flex flex-col shadow-lg">
        <CardHeader className={`border-b ${therapistInfo.color}`}>
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={therapistInfo.avatar} alt={therapistInfo.name} />
              <AvatarFallback>{therapistInfo.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle>{therapistInfo.name}</CardTitle>
              <p className="text-sm text-muted-foreground">Here to listen and support</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setSelectedTherapist(null)}>
              Change Therapist
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4">
              {messages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-center p-8">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Welcome to your session with {therapistInfo.name}</h3>
                      <p className="text-muted-foreground">
                        Share what's on your mind, and I'll do my best to provide supportive guidance.
                      </p>
                    </div>
                    {showExamples && <ExamplePrompts onSelectPrompt={handleExampleSelect} />}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.role !== "user" && (
                        <Avatar className="h-8 w-8 mr-2 flex-shrink-0">
                          <AvatarImage src={therapistInfo.avatar} alt={therapistInfo.name} />
                          <AvatarFallback>{therapistInfo.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}

                      <div
                        className={`rounded-lg px-4 py-2 max-w-[80%] ${
                          message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        <div className="flex items-start">
                          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                          {message.role !== "user" && (
                            <div className="ml-2 mt-1 flex space-x-1">
                              <TextToSpeech text={message.content} therapist={selectedTherapist || undefined} />
                            </div>
                          )}
                        </div>
                      </div>

                      {message.role === "user" && (
                        <Avatar className="h-8 w-8 ml-2 flex-shrink-0">
                          <AvatarFallback>You</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}

                  {isLoading && (
                    <TherapistTypingIndicator
                      therapistAvatar={therapistInfo.avatar}
                      therapistName={therapistInfo.name}
                    />
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        {error && (
          <div className="p-4 border-t border-red-200 bg-red-50 text-red-500">
            <p>Error: {error.message || "Failed to communicate with the AI therapist. Please try again."}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.reload()}>
              Reload
            </Button>
          </div>
        )}
        <CardFooter className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex w-full gap-2">
            <Textarea
              placeholder="Share what's on your mind..."
              value={input}
              onChange={handleInputChange}
              className="min-h-10 flex-1 resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e as any)
                }
              }}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              Send
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}

