"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Volume2 } from "lucide-react"

type MeditationExercise = {
  id: string
  title: string
  description: string
  duration: number
  audioSrc?: string
  script: string
  category: "anxiety" | "stress" | "sleep" | "focus" | "general"
}

const meditationExercises: MeditationExercise[] = [
  {
    id: "breathing-1",
    title: "Deep Breathing Exercise",
    description: "A simple breathing technique to reduce anxiety and promote relaxation",
    duration: 5,
    script: "Find a comfortable position and close your eyes. Take a deep breath in through your nose for 4 counts. Hold for 2 counts. Exhale slowly through your mouth for 6 counts. Feel your body relaxing with each breath. Continue this pattern, focusing only on your breath.",
    category: "anxiety"
  },
  {
    id: "body-scan-1",
    title: "Progressive Body Scan",
    description: "A guided body scan to release tension and promote physical relaxation",
    duration: 10,
    script: "Lie down in a comfortable position. Starting at your toes, bring awareness to each part of your body, moving upward. Notice any tension and consciously release it as you exhale. Move from your toes to your feet, legs, hips, abdomen, chest, hands, arms, shoulders, neck, and finally your head.",
    category: "stress"
  },
  {
    id: "sleep-1",
    title: "Bedtime Relaxation",
    description: "A calming exercise to prepare your mind and body for sleep",
    duration: 15,
    script: "Lie comfortably in bed. Take three deep breaths. With each exhale, feel yourself sinking deeper into relaxation. Imagine a peaceful scene - perhaps a beach at sunset or a quiet forest. Engage all your senses in this imagery. What do you see? Hear? Feel? As you continue breathing slowly, allow your body to become heavy and your mind to quiet.",
    category: "sleep"
  },
  {
    id: "focus-1",
    title: "Mindful Awareness",
    description: "A short mindfulness exercise to improve focus and present-moment awareness",
    duration: 7,
    script: "Sit in a comfortable position with your back straight. Focus your attention on your breath, feeling the sensation of air moving in and out of your body. When your mind wanders, gently bring your attention back to your breath without judgment. Notice the thoughts that arise, acknowledge them, and let them pass like clouds in the sky.",
    category: "focus"
  },
  {
    id: "gratitude-1",
    title: "Gratitude Meditation",
    description: "A positive meditation focusing on gratitude and appreciation",
    duration: 8,
    script: "Close your eyes and take a few deep breaths. Bring to mind something or someone you're grateful for. It could be something simple - a warm cup of tea, a kind gesture, or a beautiful sunset. Feel the gratitude in your heart. Notice how this feeling affects your body and mind. Continue bringing to mind things you appreciate, savoring each one.",
    category: "general"
  }
]

export function GuidedMeditation({ concernCategory = "general" }: { concernCategory?: string }) {
  const [selectedExercise, setSelectedExercise] = useState<MeditationExercise | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(80)
  const [currentTime, setCurrentTime] = useState(0)
  
  // Enhanced debug logs
  console.log("GuidedMeditation rendering with category:", concernCategory);
  console.log("All meditation categories:", meditationExercises.map(ex => ex.category));
  
  // Filter exercises based on user concerns if provided
  const filteredExercises = concernCategory 
    ? meditationExercises.filter(ex => {
        // More lenient matching
        return ex.category === "general" || // Always include general exercises
               ex.category === concernCategory || // Exact match
               // Partial matches
               ex.category.includes(concernCategory) || 
               concernCategory.includes(ex.category);
      })
    : meditationExercises
    
  console.log("Meditation exercises database contains:", meditationExercises.length, "items");
  console.log("Filtered exercises:", filteredExercises.length, "items");
  
  // If no exercises match, log detailed info for debugging
  if (filteredExercises.length === 0) {
    console.log("No matching exercises found. Detailed debug info:");
    console.log("Concern category:", concernCategory);
    console.log("All exercise categories:", meditationExercises.map(ex => ({ title: ex.title, category: ex.category })));
  }

  // If no exercises match after lenient matching, use general meditation exercises
  const displayExercises = filteredExercises.length > 0 
    ? filteredExercises 
    : meditationExercises.filter(exercise => 
        exercise.category.toLowerCase().includes("general") || 
        exercise.category.toLowerCase() === "all"
      );
  
  // If still no exercises, just show all exercises
  const finalExercises = displayExercises.length > 0 ? displayExercises : meditationExercises;
  
  console.log("Final exercises to display:", finalExercises.length);

  const handleSelectExercise = (exercise: MeditationExercise) => {
    setSelectedExercise(exercise)
    setIsPlaying(false)
    setCurrentTime(0)
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Guided Meditation</h3>
      {finalExercises.length > 0 ? (
        <>
          <p className="text-muted-foreground mb-4">
            Select an exercise to help you relax and center yourself.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {finalExercises.map((exercise) => (
              <Card key={exercise.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSelectExercise(exercise)}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{exercise.title}</CardTitle>
                  <CardDescription>{exercise.duration} minutes</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{exercise.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No exercises found</CardTitle>
            <CardDescription>
              It seems there are no exercises available for the selected category.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Please try a different category or contact support for assistance.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 