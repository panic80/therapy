'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, Dispatch, SetStateAction, FormEvent } from 'react';
import { useChat, Message } from 'ai/react';
import { TherapistOption, therapists, TherapistType } from '@/app/data/therapists';
import { analyzeConcerns, concernToMeditationCategory } from '@/app/utils/concern-analyzer'; // Assuming location

// 1. Define the Context Shape
interface TherapySessionContextType {
    // Chat State & Handlers from useChat
    messages: Message[];
    error: Error | undefined;
    isLoading: boolean;
    input: string;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void;
    handleSubmit: (e: FormEvent<HTMLFormElement>, options?: { body?: Record<string, any> }) => void;
    setInput: Dispatch<SetStateAction<string>>;
    setMessages: Dispatch<SetStateAction<Message[]>>;
    reload: () => void;
    stop: () => void;
    append: (message: Message) => Promise<string | null | undefined>;

    // Therapist State & Handler
    selectedTherapist: TherapistOption | null; // The full therapist object
    selectedTherapistId: TherapistType | null; // Keep track of the ID separately for selection state
    handleTherapistChange: (therapistId: TherapistType | null) => void; // Handler takes ID

    // Concern State
    userConcerns: string[];
    setUserConcerns: Dispatch<SetStateAction<string[]>>;
    meditationCategory: string;

    // Example Prompt Handler
    handleExampleSelect: (prompt: string) => void;

    // UI State & Handler
    showResources: boolean;
    handleToggleResources: () => void;
    showInitialUI: boolean; // Expose this if child components need it (e.g., ChatWelcome)
}

// 2. Create the Context
const TherapySessionContext = createContext<TherapySessionContextType | undefined>(undefined);

// 3. Create the Provider Component
interface TherapySessionProviderProps {
    children: ReactNode;
}

export const TherapySessionProvider: React.FC<TherapySessionProviderProps> = ({ children }) => {
    // --- State Management Logic (Moved from app/page.tsx) ---
    const [selectedTherapistId, setSelectedTherapistId] = useState<TherapistType | null>(null);
    const [savedMessages, setSavedMessages] = useState<Message[]>([]);
    const [showInitialUI, setShowInitialUI] = useState(true);
    const [showResources, setShowResources] = useState(true);
    const [userConcerns, setUserConcerns] = useState<string[]>(["general mental health"]);
    const [meditationCategory, setMeditationCategory] = useState<string>("general");
    const [chatId] = useState(() => `chat-${Date.now()}`); // Stable chat ID

    // Derive TherapistOption from ID
    const selectedTherapist = therapists.find(t => t.id === selectedTherapistId) ?? null;

    // useChat Hook (Moved from page.tsx)
    const {
        messages,
        error,
        isLoading,
        input,
        handleInputChange,
        handleSubmit: originalHandleSubmit,
        reload,
        stop,
        append,
        setInput,
        setMessages,
    } = useChat({
        api: '/api/chat',
        body: {
          therapist: selectedTherapistId, // Send therapist ID
          // userConcerns: userConcerns, // Send concerns if API needs them initially
        },
        onError: (error) => {
          console.error("Chat error (Context):", error);
        },
        id: chatId,
        // Keep initial messages empty here, handle welcome/saved messages via effects/handlers
        initialMessages: [],
    });

     // Wrapped handleSubmit to include latest therapist/concerns and handle context switching
     const handleFormSubmit = (e: FormEvent<HTMLFormElement>, options?: { body?: Record<string, any> }) => {
        e.preventDefault(); // Prevent default here

        const bodyWithOptions = {
             ...options?.body,
             therapist: selectedTherapistId,
             userConcerns, // Pass current concerns
             // Pass saved messages if API needs explicit context merge
             // savedMessages: (savedMessages.length > 0 && messages.length === 0) ? savedMessages : undefined,
         };

        // If we have saved messages and the current message list is empty,
        // it means we switched therapists and this is the first message.
        // The useChat hook's handleSubmit should handle adding the current input
        // to the messages array automatically. We just need to ensure the API
        // receives the correct context (therapistId, userConcerns).
        // The `id: chatId` should ensure useChat maintains continuity if the API supports it.
        // The `savedMessages` state is mostly for potential future use or if the API needs explicit old context.
        // For now, we rely on useChat's default behavior.

        originalHandleSubmit(e, { ...options, body: bodyWithOptions });

        // Clear saved messages after submitting the first message in a new context
        if (savedMessages.length > 0 && messages.length === 0) {
             setSavedMessages([]);
        }
     };

     // Therapist Change Handler
     const handleTherapistChange = (therapistId: TherapistType | null) => {
        // Save messages only if there are any and we are switching *to* a therapist
        if (messages.length > 0 && therapistId !== null) {
            setSavedMessages(messages);
        } else {
             setSavedMessages([]); // Clear saved messages if selecting null or if no messages existed
        }

        setSelectedTherapistId(therapistId);

        // Reset state for the new session
        setMessages([]);
        setInput(''); // Clear input field
        setUserConcerns(["general mental health"]);
        setMeditationCategory("general");
        setShowInitialUI(true); // Show welcome screen for the new therapist
        // Keep resource panel visibility as is, or reset: setShowResources(true);
     };

    // Example Prompt Handler
    const handleExampleSelect = (prompt: string) => {
        setInput(prompt);
        // Optionally focus the input field here
    };

    // Toggle Resources Handler
    const handleToggleResources = () => setShowResources(prev => !prev);

    // --- Effects (Moved from page.tsx) ---

    // Hide initial UI (welcome message/prompts) after first message exchange starts
    useEffect(() => {
        // Hide if we have messages that are not just the initial system message (if any)
        if (messages.length > 0 && messages.some(m => m.role === 'user' || m.role === 'assistant')) {
           setShowInitialUI(false);
        }
        // Keep showing if only saved messages exist but no interaction yet
        else if (savedMessages.length > 0 && messages.length === 0) {
             setShowInitialUI(true);
        }
        // Ensure it shows if therapist is selected and no messages yet
        else if (selectedTherapistId && messages.length === 0) {
            setShowInitialUI(true);
        }

    }, [messages, selectedTherapistId, savedMessages]);

    // Analyze messages to identify user concerns
    useEffect(() => {
        // Only analyze if there are messages and at least one is from the user
        if (messages.length > 0 && messages.some(m => m.role === 'user')) {
           try {
               const detectedConcerns = analyzeConcerns(messages);
               console.log("Detected concerns (Context):", detectedConcerns);
               // Avoid infinite loops by checking if concerns actually changed
               if (JSON.stringify(detectedConcerns) !== JSON.stringify(userConcerns)) {
                   setUserConcerns(detectedConcerns);
                   // Set meditation category based on primary concern
                   if (detectedConcerns.length > 0) {
                       const primaryConcern = detectedConcerns[0];
                       setMeditationCategory(concernToMeditationCategory[primaryConcern] || "general");
                   } else {
                       setMeditationCategory("general"); // Default if no concerns detected
                   }
               }
           } catch (err) {
               console.error("Error analyzing concerns:", err);
           }
        } else if (messages.length === 0 && userConcerns.length > 1 || (userConcerns.length === 1 && userConcerns[0] !== "general mental health")) {
            // Reset concerns if messages are cleared (e.g., therapist change)
            setUserConcerns(["general mental health"]);
            setMeditationCategory("general");
        }
    }, [messages, userConcerns]); // Depend on messages and userConcerns

    // --- Value provided to consumers ---
    const value: TherapySessionContextType = {
        messages,
        error,
        isLoading,
        input,
        handleInputChange,
        handleSubmit: handleFormSubmit,
        setInput,
        setMessages,
        reload,
        stop,
        append,
        selectedTherapist,
        selectedTherapistId,
        handleTherapistChange,
        userConcerns,
        setUserConcerns,
        meditationCategory,
        handleExampleSelect,
        showResources,
        handleToggleResources,
        showInitialUI,
    };

    return (
        <TherapySessionContext.Provider value={value}>
            {children}
        </TherapySessionContext.Provider>
    );
};

// 4. Create the Custom Hook
export const useTherapySession = (): TherapySessionContextType => {
    const context = useContext(TherapySessionContext);
    if (context === undefined) {
        throw new Error('useTherapySession must be used within a TherapySessionProvider');
    }
    return context;
};