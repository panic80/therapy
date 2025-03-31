"use client"

import { Card } from "@/components/ui/card" // Keep Card for ResourcePanel wrapper
import { TherapistSelection } from "./therapist-selection"
import type { TherapistType } from "./data/therapists" // Import type from data file
// Removed imports for components/logic moved to context or child components
import { ResourcePanel } from "./resource-panel"; // Import the new ResourcePanel component
import { ChatPanel } from "./chat-panel"; // Import ChatPanel
import { TherapySessionProvider, useTherapySession } from "./context/therapy-session-context"; // Import Provider and Hook

// Define the core page component structure
function TherapistChatContent() {
  // Access context values needed directly in page.tsx (only selection logic remains here)
  const { selectedTherapistId, handleTherapistChange, showResources } = useTherapySession();

  // Show therapist selection if no therapist is chosen yet
  if (!selectedTherapistId) {
    return <TherapistSelection onSelect={handleTherapistChange} />;
  }

  // Main chat and resource view
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-4">
        {/* Render the ChatPanel component - props are removed */}
        <div className="w-full lg:w-3/5">
          <ChatPanel />
        </div>

        {/* Therapy Resources Panel - props are removed */}
        <Card className={`w-full lg:w-2/5 h-[80vh] overflow-auto ${showResources ? 'block' : 'hidden lg:block'}`}>
          <ResourcePanel />
        </Card>
      </div>
    </div>
  );
}

// Default export wraps the content with the Provider
export default function TherapistChat() {
  return (
    <TherapySessionProvider>
      <TherapistChatContent />
    </TherapySessionProvider>
  );
}
