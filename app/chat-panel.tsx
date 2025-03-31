'use client';

import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatHeader } from './chat-header';
import { ChatWelcome } from './chat-welcome';
import { MessageList } from './message-list';
import { ChatErrorDisplay } from './chat-error-display';
import { ChatInputArea } from './chat-input-area';
import { useTherapySession } from './context/therapy-session-context'; // Import the context hook

// Removed ChatPanelProps interface

export function ChatPanel() {
  // Get all necessary state and handlers from context
  const {
    selectedTherapist, // The full TherapistOption object
    handleTherapistChange, // Used by ChatHeader's change therapist button
    handleToggleResources, // Used by ChatHeader's toggle button
    showResources, // Used by ChatHeader
    handleExampleSelect, // Used by ChatWelcome
    messages,
    isLoading,
    error,
    input,
    handleInputChange,
    handleSubmit, // Renamed from handleFormSubmit in context
    showInitialUI,
    selectedTherapistId // Needed for MessageList key/conditional logic?
  } = useTherapySession();

  // Derive therapist info for child components, handle null case
  const displayTherapistInfo = {
    name: selectedTherapist?.name ?? "AI Therapist",
    avatar: selectedTherapist?.avatar ?? "/placeholder-user.jpg", // Use a default placeholder
    color: selectedTherapist?.baseColor ?? "bg-primary/5", // Use baseColor
  };

  return (
    <Card className="w-full h-[80vh] flex flex-col shadow-lg"> {/* Removed lg:w-3/5 as width is handled by parent */}
      <ChatHeader
        therapistInfo={displayTherapistInfo}
        onToggleResources={handleToggleResources}
        // Pass null to handler when clicking change button
        onChangeTherapist={() => handleTherapistChange(null)}
        showResources={showResources}
      />

      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4">
            {showInitialUI ? (
              <ChatWelcome /> // Remove props, they come from context now
            ) : (
              <MessageList
                messages={messages}
                isLoading={isLoading}
                therapistAvatar={displayTherapistInfo.avatar}
                therapistName={displayTherapistInfo.name}
                selectedTherapistId={selectedTherapistId} // Correct prop name
              />
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <ChatErrorDisplay error={error} />
      <CardFooter className="border-t p-4">
        <ChatInputArea
          input={input}
          handleInputChange={handleInputChange}
          handleFormSubmit={handleSubmit} // Use handleSubmit from context
          isLoading={isLoading}
        />
      </CardFooter>
    </Card>
  );
}