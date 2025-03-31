export type TherapistType = "john" | "emma" | "ethan";

export interface TherapistOption {
  id: TherapistType;
  name: string;
  title: string;
  description: string;
  avatar: string;
  // Note: The color in therapist-selection includes border/hover states.
  // We might need a simpler color for page.tsx or adjust page.tsx later.
  // For now, let's keep the selection-specific color definition here.
  // We'll extract the base color needed for page.tsx when we modify it.
  color: string; // e.g., "bg-blue-100 border-blue-300 hover:bg-blue-200"
  baseColor: string; // Add a base color for general use, e.g., "bg-blue-100"
}

export const therapists: TherapistOption[] = [
  {
    id: "john",
    name: "Dr. John",
    title: "Practical & Direct",
    description: "Matter-of-fact, down to earth, and no-nonsense. Provides factual advice without sugar coating.",
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&auto=format&fit=crop&q=80",
    color: "bg-blue-100 border-blue-300 hover:bg-blue-200",
    baseColor: "bg-blue-100",
  },
  {
    id: "emma",
    name: "Dr. Emma",
    title: "Empathetic & Nurturing",
    description:
      "Very empathetic and sympathetic. Turns negative situations into positive ones and provides nurturing support.",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&auto=format&fit=crop&q=80",
    color: "bg-purple-100 border-purple-300 hover:bg-purple-200",
    baseColor: "bg-purple-100",
  },
  {
    id: "ethan",
    name: "Dr. Ethan",
    title: "Humorous & Uplifting",
    description:
      "Has an acute sense of humor. Listens carefully and provides valuable yet funny feedback to make you feel good.",
    avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&h=150&auto=format&fit=crop&q=80",
    color: "bg-amber-100 border-amber-300 hover:bg-amber-200",
    baseColor: "bg-amber-100",
  },
];

// Helper function to get therapist info by ID
export const getTherapistById = (id: TherapistType | null): TherapistOption | undefined => {
  if (!id) return undefined;
  return therapists.find(t => t.id === id);
};