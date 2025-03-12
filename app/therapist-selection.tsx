"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle2 } from "lucide-react"

export type TherapistType = "john" | "emma" | "ethan"

interface TherapistSelectionProps {
  onSelect: (therapist: TherapistType) => void
}

interface TherapistOption {
  id: TherapistType
  name: string
  title: string
  description: string
  avatar: string
  color: string
}

export function TherapistSelection({ onSelect }: TherapistSelectionProps) {
  const [selected, setSelected] = useState<TherapistType | null>(null)

  const therapists: TherapistOption[] = [
    {
      id: "john",
      name: "Dr. John",
      title: "Practical & Direct",
      description: "Matter-of-fact, down to earth, and no-nonsense. Provides factual advice without sugar coating.",
      avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&auto=format&fit=crop&q=80",
      color: "bg-blue-100 border-blue-300 hover:bg-blue-200",
    },
    {
      id: "emma",
      name: "Dr. Emma",
      title: "Empathetic & Nurturing",
      description:
        "Very empathetic and sympathetic. Turns negative situations into positive ones and provides nurturing support.",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&auto=format&fit=crop&q=80",
      color: "bg-purple-100 border-purple-300 hover:bg-purple-200",
    },
    {
      id: "ethan",
      name: "Dr. Ethan",
      title: "Humorous & Uplifting",
      description:
        "Has an acute sense of humor. Listens carefully and provides valuable yet funny feedback to make you feel good.",
      avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&h=150&auto=format&fit=crop&q=80",
      color: "bg-amber-100 border-amber-300 hover:bg-amber-200",
    },
  ]

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

