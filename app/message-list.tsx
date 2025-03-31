'use client';
import React, { useRef, useEffect } from 'react';
import type { Message } from '@ai-sdk/react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TextToSpeech } from "./text-to-speech"; // Assuming TextToSpeech is in the same directory or adjust path
import { TherapistTypingIndicator } from "./therapist-typing-indicator"; // Assuming TherapistTypingIndicator is in the same directory or adjust path
import { TherapistType } from '@/app/data/therapists'; // Import TherapistType

// Define the props for the MessageList component
interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  therapistAvatar: string;
  therapistName: string;
  selectedTherapistId: TherapistType | null; // Use the actual TherapistType or null
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  therapistAvatar,
  therapistName,
  selectedTherapistId
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]); // Dependency array remains the same

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
        >
          {message.role !== "user" && (
            <Avatar className="h-8 w-8 mr-2 flex-shrink-0">
              <AvatarImage src={therapistAvatar} alt={therapistName} />
              <AvatarFallback>{therapistName.charAt(0)}</AvatarFallback>
            </Avatar>
          )}

          <div
            className={`rounded-lg px-4 py-2 max-w-[80%] ${
              message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
            }`} // Removed closing parenthesis which seemed incorrect
          >
            <div className="flex items-start">
              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
              {message.role !== "user" && (
                <div className="ml-2 mt-1 flex space-x-1">
                   {/* Pass selectedTherapistId (TherapistType) or undefined */}
                  <TextToSpeech text={message.content} therapist={selectedTherapistId ?? undefined} />
                </div>
              )}
            </div>
          </div>

          {message.role === "user" && (
            <Avatar className="h-8 w-8 ml-2 flex-shrink-0">
              <AvatarFallback>You</AvatarFallback>
            </Avatar>
          )}
        </div>
      ))}

      {isLoading && (
        <TherapistTypingIndicator therapistAvatar={therapistAvatar} therapistName={therapistName} />
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};