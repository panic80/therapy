'use client'; // Add use client directive

import React from "react";
import { Button } from "@/components/ui/button";
import { useTherapySession } from "./context/therapy-session-context"; // Keep for reload

interface ChatErrorDisplayProps {
  error: Error | undefined;
}

export const ChatErrorDisplay: React.FC<ChatErrorDisplayProps> = ({ error }) => {
  const { reload } = useTherapySession(); // Get only reload from context

  if (!error) {
    return null; // Render nothing if there's no error
  }

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="p-4 border-t border-red-200 bg-red-50 text-red-600"> {/* Adjusted text color slightly */}
      <p>Error: {error.message || "Failed to communicate with the AI therapist. Please try again."}</p>
      {/* Option 1: Keep page reload */}
      {/* <Button variant="outline" size="sm" className="mt-2 border-red-300 text-red-700 hover:bg-red-100" onClick={handleReload}> */}
      {/*   Reload Page */}
      {/* </Button> */}
      {/* Option 2: Use useChat's reload to retry last request */}
      <Button variant="outline" size="sm" className="mt-2 border-red-300 text-red-700 hover:bg-red-100" onClick={() => reload()}>
        Retry Request
      </Button>
    </div>
  );
};