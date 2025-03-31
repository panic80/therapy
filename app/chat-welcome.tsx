'use client'; // Ensure this is the very first line

import React from "react";
import { ExamplePrompts } from "./example-prompts";
import { useTherapySession } from "./context/therapy-session-context";

 // Remove ChatWelcomeProps

export function ChatWelcome() {
  // Get therapist name and prompt handler from context
  const { selectedTherapist, handleExampleSelect } = useTherapySession();

  // Use a fallback name if therapist is somehow null when this renders
  const therapistName = selectedTherapist?.name ?? "AI Therapist";

  return (
    <div className="flex h-full items-center justify-center text-center p-8">
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">
            Welcome to your session with {therapistName}
          </h3>
          <p className="text-muted-foreground">
            Share what's on your mind, and I'll do my best to provide supportive
            guidance.
          </p>
        </div>
        {/* Pass the handleExampleSelect handler down to ExamplePrompts */}
        <ExamplePrompts onSelectPrompt={handleExampleSelect} />
      </div>
    </div>
  );
}