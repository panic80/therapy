"use client"

import { Button } from "@/components/ui/button"

interface ExamplePromptsProps {
  onSelectPrompt: (prompt: string) => void
}

export function ExamplePrompts({ onSelectPrompt }: ExamplePromptsProps) {
  const prompts = [
    "I've been feeling overwhelmed lately with work and personal responsibilities.",
    "I keep having the same argument with my partner and don't know how to break the cycle.",
    "I'm struggling to make an important decision and feel stuck.",
    "I've been feeling anxious about the future and can't seem to relax.",
  ]

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">Try starting with one of these:</p>
      <div className="flex flex-wrap gap-2">
        {prompts.map((prompt, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="text-xs text-left"
            onClick={() => onSelectPrompt(prompt)}
          >
            {prompt.length > 40 ? prompt.substring(0, 40) + "..." : prompt}
          </Button>
        ))}
      </div>
    </div>
  )
}

