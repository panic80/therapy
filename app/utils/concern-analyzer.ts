// Define common mental health concerns and their related keywords
const concernKeywords = {
  anxiety: [
    "anxiety", "anxious", "worry", "panic", "stress", "nervous", "fear", "phobia",
    "overwhelm", "overthinking", "racing thoughts"
  ],
  depression: [
    "depression", "depressed", "sad", "hopeless", "unmotivated", "tired", "exhausted",
    "worthless", "empty", "numb", "low mood", "no interest", "no energy"
  ],
  stress: [
    "stress", "stressed", "pressure", "burnout", "overwhelmed", "tension", "overworked",
    "busy", "no time", "deadline", "workload"
  ],
  sleep: [
    "insomnia", "can't sleep", "trouble sleeping", "sleep problems", "nightmares",
    "tired", "fatigue", "exhausted", "restless", "waking up"
  ],
  relationships: [
    "relationship", "partner", "spouse", "marriage", "boyfriend", "girlfriend",
    "dating", "breakup", "divorce", "conflict", "argument", "trust issues"
  ],
  trauma: [
    "trauma", "ptsd", "abuse", "assault", "accident", "grief", "loss",
    "flashbacks", "nightmares", "triggered"
  ],
  selfEsteem: [
    "self-esteem", "confidence", "insecure", "inadequate", "not good enough",
    "failure", "imposter syndrome", "self-doubt", "self-image"
  ],
  addiction: [
    "addiction", "substance", "alcohol", "drugs", "gambling", "smoking",
    "dependency", "cravings", "withdrawal", "relapse"
  ],
  anger: [
    "anger", "angry", "rage", "irritable", "frustrated", "temper",
    "outbursts", "resentment", "hostile"
  ],
  socialAnxiety: [
    "social anxiety", "shy", "awkward", "embarrassed", "judged", "criticized",
    "public speaking", "social situations", "meeting new people"
  ]
};

/**
 * Analyzes a collection of user messages to identify potential mental health concerns
 * @param messages Array of message objects with content and role properties
 * @returns Array of identified concerns sorted by relevance
 */
export function analyzeConcerns(messages: { content: string, role: string }[]): string[] {
  console.log("Analyzing concerns from", messages.length, "messages");
  
  // Filter for user messages only
  const userMessages = messages.filter(msg => msg.role === 'user');
  
  if (userMessages.length === 0) {
    console.log("No user messages found, returning default concern");
    return ["general mental health"];
  }
  
  // Combine all user messages into a single string for analysis
  const combinedText = userMessages.map(msg => msg.content).join(" ").toLowerCase();
  console.log("Combined text (first 100 chars):", combinedText.substring(0, 100));
  
  // Define keywords for different mental health concerns
  const concernKeywords: Record<string, string[]> = {
    "anxiety": ["anxious", "anxiety", "worry", "worried", "panic", "fear", "nervous", "stress", "tense", "uneasy"],
    "depression": ["depressed", "depression", "sad", "sadness", "hopeless", "despair", "miserable", "unhappy", "down", "blue", "empty"],
    "stress": ["stress", "stressed", "overwhelmed", "pressure", "burnout", "exhausted", "tension", "strain"],
    "sleep": ["insomnia", "sleep", "tired", "fatigue", "exhausted", "rest", "nightmare", "dream", "awake", "bed"],
    "relationships": ["relationship", "partner", "spouse", "marriage", "friend", "family", "social", "connection", "lonely", "alone"],
    "self-esteem": ["confidence", "self-esteem", "worth", "value", "inadequate", "failure", "imposter", "doubt", "insecure"],
    "trauma": ["trauma", "ptsd", "abuse", "assault", "accident", "grief", "loss", "death", "flashback", "nightmare"],
    "anger": ["anger", "angry", "rage", "furious", "irritated", "annoyed", "temper", "mad", "hostile", "resentment"],
    "addiction": ["addiction", "substance", "alcohol", "drug", "gambling", "compulsive", "craving", "withdrawal", "relapse"],
    "work": ["job", "career", "work", "workplace", "boss", "colleague", "promotion", "fired", "unemployed", "office"],
    "general mental health": ["mental health", "therapy", "counseling", "wellbeing", "wellness", "self-care", "mindfulness", "meditation"]
  };
  
  // Count keyword matches for each concern
  const concernCounts: Record<string, number> = {};
  
  for (const [concern, keywords] of Object.entries(concernKeywords)) {
    let count = 0;
    for (const keyword of keywords) {
      // Use regex to find whole word matches
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = (combinedText.match(regex) || []).length;
      count += matches;
    }
    concernCounts[concern] = count;
    console.log(`Found ${count} matches for concern: ${concern}`);
  }
  
  // Sort concerns by count and take the top 3
  const sortedConcerns = Object.entries(concernCounts)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([concern, _]) => concern);
  
  // If no concerns meet the threshold, return a default
  if (sortedConcerns.length === 0) {
    console.log("No concerns detected, returning default concern");
    return ["general mental health"];
  }
  
  // Take the top 3 concerns or all if less than 3
  const topConcerns = sortedConcerns.slice(0, 3);
  console.log("Detected concerns:", topConcerns);
  
  // Always include general mental health if we have less than 3 concerns
  if (topConcerns.length < 3 && !topConcerns.includes("general mental health")) {
    topConcerns.push("general mental health");
    console.log("Added general mental health as a fallback concern");
  }
  
  return topConcerns;
}

/**
 * Maps concern identifiers to user-friendly display names
 */
export const concernDisplayNames: Record<string, string> = {
  anxiety: "Anxiety",
  depression: "Depression",
  stress: "Stress Management",
  sleep: "Sleep Problems",
  relationships: "Relationship Issues",
  trauma: "Trauma & PTSD",
  selfEsteem: "Self-Esteem",
  addiction: "Addiction & Recovery",
  anger: "Anger Management",
  socialAnxiety: "Social Anxiety",
  "general mental health": "General Mental Health"
};

/**
 * Maps concern identifiers to meditation categories
 */
export const concernToMeditationCategory: Record<string, string> = {
  anxiety: "anxiety",
  stress: "stress",
  sleep: "sleep",
  depression: "general",
  relationships: "general",
  trauma: "general",
  selfEsteem: "general",
  addiction: "general",
  anger: "general",
  socialAnxiety: "anxiety",
  "general mental health": "general"
}; 