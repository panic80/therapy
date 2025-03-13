"use client"

import { useRef, useEffect, useState } from "react"
import { useChat } from "@ai-sdk/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { TherapistTypingIndicator } from "./therapist-typing-indicator"
import { ExamplePrompts } from "./example-prompts"
import { TextToSpeech } from "./text-to-speech"
import { TherapistSelection, type TherapistType } from "./therapist-selection"
import { TherapyResources } from "./therapy-resources"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GuidedMeditation } from "./guided-meditation"
import { ResourceRecommendations } from "./resource-recommendations"
import { analyzeConcerns, concernDisplayNames, concernToMeditationCategory } from "./utils/concern-analyzer"

export default function TherapistChat() {
  const [selectedTherapist, setSelectedTherapist] = useState<TherapistType | null>(null)
  const [savedMessages, setSavedMessages] = useState<any[]>([])
  const [showInitialUI, setShowInitialUI] = useState(true)
  const [showResources, setShowResources] = useState(true)
  const [userConcerns, setUserConcerns] = useState<string[]>(["general mental health"])
  const [meditationCategory, setMeditationCategory] = useState<string>("general")
  const [therapistInfo, setTherapistInfo] = useState({
    name: "AI Therapist",
    avatar: "/placeholder.svg?height=40&width=40",
    color: "bg-primary/5",
  })

  // Use a stable ID for the chat across therapist changes
  const [chatId] = useState(() => `chat-${Date.now()}`)

  const { messages, input, handleInputChange, handleSubmit, isLoading, error, setInput, setMessages } = useChat({
    api: "/api/chat",
    body: {
      therapist: selectedTherapist,
    },
    onError: (error) => {
      console.error("Chat error:", error)
    },
    id: chatId, // Use the stable ID instead of therapist-based ID
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
      setShowInitialUI(false) // Also hide initial UI when we have messages
    }
  }, [messages.length])

  // Analyze messages to identify user concerns
  useEffect(() => {
    if (messages.length > 0) {
      try {
        // Only analyze when we have at least one user message
        const userMessages = messages.filter(msg => msg.role === 'user');
        if (userMessages.length > 0) {
          const detectedConcerns = analyzeConcerns(messages);
          console.log("Detected concerns:", detectedConcerns);
          setUserConcerns(detectedConcerns);
          
          // Set meditation category based on primary concern
          if (detectedConcerns.length > 0) {
            const primaryConcern = detectedConcerns[0];
            setMeditationCategory(concernToMeditationCategory[primaryConcern] || "general");
          }
        }
      } catch (error) {
        console.error("Error analyzing concerns:", error);
      }
    }
  }, [messages]);

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
    
    // Save messages in the background for context, but don't display them in UI
    if (selectedTherapist && savedMessages.length > 0) {
      // We keep the saved messages for API context, but don't show them in the UI
      setMessages([]) // Reset UI messages
    }
  }, [selectedTherapist, savedMessages, setMessages])

  const handleExampleSelect = (prompt: string) => {
    setInput(prompt)
  }

  const handleTherapistSelect = (therapist: TherapistType) => {
    setSelectedTherapist(therapist)
    setShowInitialUI(true) // Show initial UI with welcome message and example prompts
    setShowExamples(true) // Show example prompts again
  }

  const handleChangeTherapist = () => {
    // Save current messages before changing therapist
    setSavedMessages(messages)
    setSelectedTherapist(null)
  }

  // When submitting a message after therapist change, include context from previous conversation
  const handleMessageSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (savedMessages.length > 0 && messages.length === 0) {
      // If we have saved messages but UI is empty, this is a continuation
      // We'll submit the message with previous context to the API, but only show the new interaction in UI
      const userMessage = { 
        role: 'user' as const, 
        content: input,
        id: `user-${Date.now()}`
      }
      
      // Send both saved context and new message to API
      setMessages([userMessage])
    } else {
      // Normal submission
      handleSubmit(e)
    }
  }

  const toggleResources = () => {
    setShowResources(!showResources)
  }

  if (!selectedTherapist) {
    return <TherapistSelection onSelect={handleTherapistSelect} />
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-4">
        <Card className="w-full lg:w-3/5 h-[80vh] flex flex-col shadow-lg">
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
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={toggleResources} className="lg:hidden">
                  {showResources ? "Hide Resources" : "Show Resources"}
                </Button>
                <Button variant="outline" size="sm" onClick={handleChangeTherapist}>
                  Change Therapist
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4">
                {showInitialUI ? (
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
            <form onSubmit={handleMessageSubmit} className="flex w-full gap-2">
              <Textarea
                placeholder="Share what's on your mind..."
                value={input}
                onChange={handleInputChange}
                className="min-h-10 flex-1 resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleMessageSubmit(e as any)
                  }
                }}
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                Send
              </Button>
            </form>
          </CardFooter>
        </Card>
        
        {/* Therapy Resources Panel */}
        <Card className={`w-full lg:w-2/5 h-[80vh] overflow-auto ${showResources ? 'block' : 'hidden lg:block'}`}>
          <CardHeader>
            <CardTitle>Therapy Resources</CardTitle>
            <CardDescription>
              Tools and resources to support your mental health journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userConcerns.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">Based on your conversation, we've identified these areas of focus:</p>
                <div className="flex flex-wrap gap-2">
                  {userConcerns.slice(0, 3).map(concern => (
                    <span key={concern} className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm">
                      {concernDisplayNames[concern] || concern}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <Tabs defaultValue="meditation">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="meditation">Guided Meditation</TabsTrigger>
                <TabsTrigger value="resources">Helpful Resources</TabsTrigger>
              </TabsList>
              
              <TabsContent value="meditation" className="mt-4">
                <GuidedMeditation concernCategory={meditationCategory} />
              </TabsContent>
              
              <TabsContent value="resources" className="mt-4">
                <ResourceRecommendations userConcerns={userConcerns} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

