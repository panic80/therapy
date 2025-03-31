"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GuidedMeditation } from "./guided-meditation";
import { ResourceRecommendations } from "./resource-recommendations";
import { concernDisplayNames } from "./utils/concern-analyzer";
import { useTherapySession } from "./context/therapy-session-context"; // Import context hook

// Remove props interface

export function ResourcePanel() {
  // Get values from context
  const { userConcerns, meditationCategory } = useTherapySession();

  return (
    <>
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
    </>
  );
}