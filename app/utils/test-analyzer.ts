import { analyzeConcerns, concernDisplayNames, concernToMeditationCategory } from './concern-analyzer';

// Sample messages for testing
const sampleMessages = [
  { role: "user", content: "I've been feeling anxious lately and having trouble sleeping." },
  { role: "assistant", content: "I'm sorry to hear you're experiencing anxiety and sleep issues. Can you tell me more about what's been causing your anxiety?" },
  { role: "user", content: "I think it's related to work stress and deadlines." }
];

// Test the analyzeConcerns function
const concerns = analyzeConcerns(sampleMessages);
console.log("Detected concerns:", concerns);

// Test the concernDisplayNames mapping
concerns.forEach(concern => {
  console.log(`Display name for ${concern}: ${concernDisplayNames[concern]}`);
});

// Test the concernToMeditationCategory mapping
concerns.forEach(concern => {
  console.log(`Meditation category for ${concern}: ${concernToMeditationCategory[concern]}`);
}); 