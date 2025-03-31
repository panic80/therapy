"use client"

import React, { ChangeEvent, FormEvent } from "react" // Import specific event types
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

// Define the props for the ChatInputArea component
interface ChatInputAreaProps {
  input: string;
  handleInputChange: (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>) => void;
  handleFormSubmit: (e: FormEvent<HTMLFormElement>) => void; // Use FormEvent
  isLoading: boolean;
  placeholder?: string;
}

export function ChatInputArea({
  input,
  handleInputChange,
  handleFormSubmit, // Use the prop name passed from parent
  isLoading,
  placeholder = "Share what's on your mind..." // Default placeholder
}: ChatInputAreaProps) {

  return (
    <form onSubmit={handleFormSubmit} className="flex w-full gap-2"> {/* Use handleFormSubmit prop */}
      <Textarea
        placeholder={placeholder}
        value={input}
        onChange={handleInputChange}
        className="min-h-10 flex-1 resize-none"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            // We need to manually trigger the form submission here
            // Create a synthetic event or find a way to trigger the form's onSubmit
            const form = e.currentTarget.closest('form');
            if (form) {
              // Create a submit event
              const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
              // Dispatch it on the form
              if (!form.dispatchEvent(submitEvent)) {
                // If the event was cancelled, log it (optional)
                console.log("Form submission cancelled by preventDefault in onKeyDown handler.");
              }
            }
          }
        }}
      />
      <Button type="submit" disabled={isLoading || !input.trim()}>
        Send
      </Button>
    </form>
  )
}