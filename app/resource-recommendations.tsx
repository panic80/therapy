"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Video, Headphones, Globe, BookmarkPlus, ExternalLink } from "lucide-react"

type ResourceType = "article" | "video" | "podcast" | "website" | "book" | "app"

type Resource = {
  id: string
  title: string
  description: string
  url: string
  type: ResourceType
  tags: string[]
  concerns: string[]
}

// Sample resources database
const resources: Resource[] = [
  // Anxiety resources
  {
    id: "anxiety-1",
    title: "Understanding and Managing Anxiety",
    description: "A comprehensive guide to understanding anxiety triggers and effective coping strategies",
    url: "https://www.helpguide.org/articles/anxiety/anxiety-disorders-and-anxiety-attacks.htm",
    type: "article",
    tags: ["self-help", "coping strategies", "education"],
    concerns: ["anxiety", "stress", "panic attacks"]
  },
  {
    id: "anxiety-2",
    title: "Anxiety Relief Techniques - 10 Minute Practice",
    description: "A guided video showing quick anxiety relief techniques you can practice anywhere",
    url: "https://www.youtube.com/watch?v=O-6f5wQXSu8",
    type: "video",
    tags: ["guided practice", "quick relief", "breathing techniques"],
    concerns: ["anxiety", "stress", "overwhelm"]
  },
  {
    id: "anxiety-3",
    title: "Calm App",
    description: "An app for meditation, sleep stories, and relaxation exercises specifically designed for anxiety relief",
    url: "https://www.calm.com/",
    type: "app",
    tags: ["meditation", "sleep", "relaxation"],
    concerns: ["anxiety", "sleep problems", "stress"]
  },
  
  // Depression resources
  {
    id: "depression-1",
    title: "Depression: What You Need To Know",
    description: "An informative guide about depression symptoms, causes, and treatment options",
    url: "https://www.nimh.nih.gov/health/publications/depression-what-you-need-to-know",
    type: "article",
    tags: ["education", "treatment options", "symptoms"],
    concerns: ["depression", "low mood", "hopelessness"]
  },
  {
    id: "depression-2",
    title: "The Hilarious World of Depression",
    description: "A podcast where comedians discuss their experiences with depression in an approachable way",
    url: "https://www.hilariousworld.org/",
    type: "podcast",
    tags: ["personal stories", "humor", "community"],
    concerns: ["depression", "isolation", "stigma"]
  },
  
  // Stress resources
  {
    id: "stress-1",
    title: "Why Zebras Don't Get Ulcers",
    description: "A book by Robert Sapolsky explaining the science of stress and its effects on the body",
    url: "https://www.goodreads.com/book/show/327.Why_Zebras_Don_t_Get_Ulcers",
    type: "book",
    tags: ["science", "education", "stress physiology"],
    concerns: ["stress", "burnout", "physical symptoms"]
  },
  {
    id: "stress-2",
    title: "Headspace",
    description: "A meditation app with specific programs for stress reduction and mindfulness",
    url: "https://www.headspace.com/",
    type: "app",
    tags: ["meditation", "mindfulness", "guided practice"],
    concerns: ["stress", "overwhelm", "focus problems"]
  },
  
  // Sleep problems
  {
    id: "sleep-1",
    title: "Sleep Foundation",
    description: "A comprehensive resource for understanding sleep disorders and improving sleep quality",
    url: "https://www.sleepfoundation.org/",
    type: "website",
    tags: ["sleep hygiene", "education", "research"],
    concerns: ["sleep problems", "insomnia", "fatigue"]
  },
  
  // Relationship issues
  {
    id: "relationships-1",
    title: "The Gottman Institute",
    description: "Research-based relationship advice and resources from leading relationship experts",
    url: "https://www.gottman.com/",
    type: "website",
    tags: ["communication", "conflict resolution", "intimacy"],
    concerns: ["relationship issues", "communication problems", "conflict"]
  },
  
  // General mental health
  {
    id: "general-1",
    title: "Mental Health First Aid",
    description: "Resources for understanding and supporting mental health in yourself and others",
    url: "https://www.mentalhealthfirstaid.org/mental-health-resources/",
    type: "website",
    tags: ["education", "support", "crisis resources"],
    concerns: ["general mental health", "support", "education"]
  }
]

const getIconForResourceType = (type: ResourceType) => {
  switch (type) {
    case "article":
      return <BookOpen className="h-4 w-4" />
    case "video":
      return <Video className="h-4 w-4" />
    case "podcast":
      return <Headphones className="h-4 w-4" />
    case "website":
      return <Globe className="h-4 w-4" />
    case "book":
      return <BookOpen className="h-4 w-4" />
    case "app":
      return <BookmarkPlus className="h-4 w-4" />
    default:
      return <BookOpen className="h-4 w-4" />
  }
}

export function ResourceRecommendations({ 
  userConcerns = ["general mental health"]
}: { 
  userConcerns?: string[] 
}) {
  const [savedResources, setSavedResources] = useState<string[]>([])
  
  // Enhanced debug logs
  console.log("ResourceRecommendations rendering with concerns:", userConcerns);
  
  // Filter resources based on user concerns
  const relevantResources = resources.filter(resource => 
    resource.concerns.some(concern => 
      userConcerns.some(userConcern => {
        // More lenient matching - check if either string contains the other
        const userConcernLower = userConcern.toLowerCase();
        const resourceConcernLower = concern.toLowerCase();
        return resourceConcernLower.includes(userConcernLower) || 
               userConcernLower.includes(resourceConcernLower) ||
               // Also match on partial words
               resourceConcernLower.split(' ').some(word => userConcernLower.includes(word)) ||
               userConcernLower.split(' ').some(word => resourceConcernLower.includes(word));
      })
    )
  )
  
  console.log("Resources database contains:", resources.length, "items");
  console.log("Filtered resources:", relevantResources.length, "items");
  console.log("Resource concerns:", resources.map(r => r.concerns).flat());
  
  // If no resources match, log detailed info for debugging
  if (relevantResources.length === 0) {
    console.log("No matching resources found. Detailed debug info:");
    console.log("User concerns:", userConcerns);
    console.log("All resource concerns:", resources.map(r => ({ title: r.title, concerns: r.concerns })));
    
    // Try a more lenient matching approach for debugging
    const lenientMatches = resources.filter(resource => 
      resource.concerns.some(concern => 
        userConcerns.some(userConcern => 
          concern.includes(userConcern) || userConcern.includes(concern)
        )
      )
    );
    console.log("Lenient matching found:", lenientMatches.length, "resources");
  }
  
  // If no resources match after lenient matching, use general mental health resources
  const displayResources = relevantResources.length > 0 
    ? relevantResources 
    : resources.filter(resource => 
        resource.concerns.some(concern => 
          concern.toLowerCase().includes("general") || 
          concern.toLowerCase().includes("mental health")
        )
      );
  
  // If still no resources, just show all resources
  const finalResources = displayResources.length > 0 ? displayResources : resources;
  
  // Group resources by type for the tabs
  const articleResources = finalResources.filter(r => r.type === "article")
  const videoResources = finalResources.filter(r => r.type === "video")
  const appResources = finalResources.filter(r => r.type === "app" || r.type === "website")
  const otherResources = finalResources.filter(r => 
    r.type !== "article" && r.type !== "video" && r.type !== "app" && r.type !== "website"
  )
  
  const toggleSaveResource = (id: string) => {
    setSavedResources(prev => 
      prev.includes(id) 
        ? prev.filter(r => r !== id) 
        : [...prev, id]
    )
  }
  
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Recommended Resources</h3>
        <p className="text-muted-foreground">
          Helpful resources tailored to your specific concerns.
        </p>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="articles">Articles</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="apps">Apps & Websites</TabsTrigger>
          <TabsTrigger value="other">Other</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {finalResources.length > 0 ? (
            finalResources.map(resource => (
              <ResourceCard 
                key={resource.id} 
                resource={resource} 
                isSaved={savedResources.includes(resource.id)}
                onToggleSave={() => toggleSaveResource(resource.id)}
              />
            ))
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              No resources found matching your concerns. Try adjusting your filters.
            </p>
          )}
        </TabsContent>
        
        <TabsContent value="articles" className="space-y-4">
          {articleResources.length > 0 ? (
            articleResources.map(resource => (
              <ResourceCard 
                key={resource.id} 
                resource={resource} 
                isSaved={savedResources.includes(resource.id)}
                onToggleSave={() => toggleSaveResource(resource.id)}
              />
            ))
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              No articles found matching your concerns.
            </p>
          )}
        </TabsContent>
        
        <TabsContent value="videos" className="space-y-4">
          {videoResources.length > 0 ? (
            videoResources.map(resource => (
              <ResourceCard 
                key={resource.id} 
                resource={resource} 
                isSaved={savedResources.includes(resource.id)}
                onToggleSave={() => toggleSaveResource(resource.id)}
              />
            ))
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              No videos found matching your concerns.
            </p>
          )}
        </TabsContent>
        
        <TabsContent value="apps" className="space-y-4">
          {appResources.length > 0 ? (
            appResources.map(resource => (
              <ResourceCard 
                key={resource.id} 
                resource={resource} 
                isSaved={savedResources.includes(resource.id)}
                onToggleSave={() => toggleSaveResource(resource.id)}
              />
            ))
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              No apps or websites found matching your concerns.
            </p>
          )}
        </TabsContent>
        
        <TabsContent value="other" className="space-y-4">
          {otherResources.length > 0 ? (
            otherResources.map(resource => (
              <ResourceCard 
                key={resource.id} 
                resource={resource} 
                isSaved={savedResources.includes(resource.id)}
                onToggleSave={() => toggleSaveResource(resource.id)}
              />
            ))
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              No other resources found matching your concerns.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ResourceCard({ 
  resource, 
  isSaved, 
  onToggleSave 
}: { 
  resource: Resource
  isSaved: boolean
  onToggleSave: () => void
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getIconForResourceType(resource.type)}
            <CardTitle className="text-base">{resource.title}</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggleSave}
            className={isSaved ? "text-primary" : "text-muted-foreground"}
          >
            <BookmarkPlus className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="flex flex-wrap gap-1 mt-1">
          <Badge variant="outline" className="capitalize">{resource.type}</Badge>
          {resource.tags.slice(0, 2).map(tag => (
            <Badge key={tag} variant="secondary" className="capitalize">{tag}</Badge>
          ))}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{resource.description}</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" asChild className="w-full">
          <a href={resource.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
            <span>Visit Resource</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  )
} 