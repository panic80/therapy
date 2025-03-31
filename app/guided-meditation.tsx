"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Play, Pause } from "lucide-react"
import { type MeditationExercise, meditationExercises } from "./data/meditations"

export function GuidedMeditation({ concernCategory = "general" }: { concernCategory?: string }) {
  const [selectedExercise, setSelectedExercise] = useState<MeditationExercise | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playingAudioSrc, setPlayingAudioSrc] = useState<string | null>(null); // State for the audio source
  const [volume, setVolume] = useState(80)
  const [currentTime, setCurrentTime] = useState(0)
  
  // Filter exercises based on user concerns if provided
  const normalizedConcern = concernCategory?.toLowerCase();

  let finalExercises = meditationExercises.filter(ex => {
    // If no concern category is provided, show all exercises.
    if (!normalizedConcern) {
      return true;
    }
    const normalizedExCategory = ex.category.toLowerCase();
    // Always include 'general' exercises.
    if (normalizedExCategory === 'general') {
      return true;
    }
    // Match specific category (exact or partial using includes, like original logic)
    return normalizedExCategory === normalizedConcern ||
           normalizedExCategory.includes(normalizedConcern) ||
           normalizedConcern.includes(normalizedExCategory);
  });

  // Fallback: If filtering yielded no results *and* a specific concern was provided, show all exercises.
  if (normalizedConcern && finalExercises.length === 0 && meditationExercises.length > 0) {
    finalExercises = meditationExercises; // Fallback to showing all
  }

  const handleSelectExercise = (exercise: MeditationExercise) => {
    setSelectedExercise(exercise)
    setPlayingAudioSrc(exercise.audioSrc ?? null); // Set the audio source
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
              <Card
                key={exercise.id}
                className={`cursor-pointer hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors ${selectedExercise?.id === exercise.id ? 'border-primary border-2' : ''}`}
                onClick={() => handleSelectExercise(exercise)}
                role="button"
                tabIndex={0}
                aria-label={`Play ${exercise.title}`}
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault(); // Prevent scrolling on spacebar press
                    handleSelectExercise(exercise);
                  }
                }}
              >
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
      {/* Audio Player */}
      {playingAudioSrc && (
        <div className="mt-6 p-4 border rounded-lg bg-muted">
          <h4 className="font-semibold mb-2">Now Playing: {selectedExercise?.title}</h4>
          <audio controls src={playingAudioSrc} className="w-full">
            Your browser does not support the audio element.
          </audio>
          {/* TODO: Add volume slider and custom controls later if needed */}
        </div>
      )}

            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 