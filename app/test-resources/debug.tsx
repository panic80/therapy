"use client"

import { GuidedMeditation } from "../guided-meditation"
import { ResourceRecommendations } from "../resource-recommendations"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DebugPage() {
  console.log("Debug page rendering");
  
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug Resources Page</h1>
      
      <Card className="w-full mb-8">
        <CardHeader>
          <CardTitle>Guided Meditation Component Test</CardTitle>
          <CardDescription>Testing the GuidedMeditation component directly</CardDescription>
        </CardHeader>
        <CardContent>
          <GuidedMeditation concernCategory="general" />
        </CardContent>
      </Card>
      
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Resource Recommendations Component Test</CardTitle>
          <CardDescription>Testing the ResourceRecommendations component directly</CardDescription>
        </CardHeader>
        <CardContent>
          <ResourceRecommendations userConcerns={["general mental health"]} />
        </CardContent>
      </Card>
    </div>
  )
} 