"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GuidedMeditation } from "./guided-meditation"
import { ResourceRecommendations } from "./resource-recommendations"
import { analyzeConcerns, concernDisplayNames, concernToMeditationCategory } from "./utils/concern-analyzer"

export function TherapyResources({ 
  messages = []
}: { 
  messages: { content: string, role: string }[]
}) {
  const [userConcerns, setUserConcerns] = useState<string[]>(["general mental health"])
  const [meditationCategory, setMeditationCategory] = useState<string>("general")
  
  // Debug logs
  console.log("TherapyResources component rendering", { 
    messagesLength: messages.length,
    userConcerns,
    meditationCategory
  });
  
  // Analyze messages to identify user concerns whenever messages change
  useEffect(() => {
    console.log("TherapyResources useEffect running", { messagesLength: messages.length });
    
    if (messages.length > 0) {
      try {
        const detectedConcerns = analyzeConcerns(messages);
        console.log("Detected concerns:", detectedConcerns);
        setUserConcerns(detectedConcerns);
        
        // Set meditation category based on primary concern
        if (detectedConcerns.length > 0) {
          const primaryConcern = detectedConcerns[0];
          setMeditationCategory(concernToMeditationCategory[primaryConcern] || "general");
        }
      } catch (error) {
        console.error("Error analyzing concerns:", error);
      }
    }
  }, [messages]);
  
  return (
    <Card className="w-full">
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
  )
} 