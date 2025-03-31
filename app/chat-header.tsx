'use client'; // Ensure this is the very first line

import React from 'react'; // Ensure React is imported
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CardHeader, CardTitle } from "@/components/ui/card"

// Define the types for the props
interface TherapistInfo {
  name: string;
  avatar: string;
  color: string;
}

interface ChatHeaderProps {
  therapistInfo: TherapistInfo;
  onToggleResources: () => void;
  onChangeTherapist: () => void;
  showResources: boolean;
}

export function ChatHeader({
  therapistInfo,
  onToggleResources,
  onChangeTherapist,
  showResources
}: ChatHeaderProps) {

  return (
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
          <Button variant="outline" size="sm" onClick={onToggleResources} className="lg:hidden">
            {showResources ? "Hide Resources" : "Show Resources"}
          </Button>
          {/* Call onChangeTherapist directly assuming it handles the logic */}
          <Button variant="outline" size="sm" onClick={onChangeTherapist}>
            Change Therapist
          </Button>
        </div>
      </div>
    </CardHeader>
  )
}