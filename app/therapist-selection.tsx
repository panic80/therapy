"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { therapists, type TherapistType, type TherapistOption } from "./data/therapists"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle2 } from "lucide-react"

interface TherapistSelectionProps {
  onSelect: (therapist: TherapistType) => void
}

export function TherapistSelection({ onSelect }: TherapistSelectionProps) {
  const [selected, setSelected] = useState<TherapistType | null>(null)

  const handleSelect = (therapist: TherapistType) => {
    setSelected(therapist)
  }

  const handleConfirm = () => {
    if (selected) {
      onSelect(selected)
    }
  }

  return (
    <div className="space-y-6 py-8 max-w-3xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Choose Your Therapist</h1>
        <p className="text-muted-foreground">Select the therapist whose approach resonates with you the most</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {therapists.map((therapist) => (
          <Card
            key={therapist.id}
            className={`relative cursor-pointer border-2 transition-all ${
              selected === therapist.id
                ? `${therapist.color} ring-2 ring-offset-2 ring-offset-background ring-primary`
                : "hover:border-muted-foreground/50"
            }`}
            onClick={() => handleSelect(therapist.id)}
          >
            {selected === therapist.id && (
              <div className="absolute top-2 right-2 text-primary">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            )}
            <CardHeader className="text-center pb-2">
              <Avatar className="h-20 w-20 mx-auto mb-2">
                <AvatarImage src={therapist.avatar} alt={therapist.name} />
                <AvatarFallback>{therapist.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <CardTitle>{therapist.name}</CardTitle>
              <CardDescription>{therapist.title}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-center">{therapist.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center">
        <Button size="lg" onClick={handleConfirm} disabled={!selected} className="px-8">
          Start Session
        </Button>
      </div>
    </div>
  )
}

