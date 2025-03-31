export type MeditationExercise = {
  id: string;
  title: string;
  description: string;
  duration: number;
  audioSrc?: string;
  script: string;
  category: "anxiety" | "stress" | "sleep" | "focus" | "general";
};

export const meditationExercises: MeditationExercise[] = [
  {
    id: "breathing-1",
    title: "Deep Breathing Exercise",
    description: "A simple breathing technique to reduce anxiety and promote relaxation",
    duration: 5,
    audioSrc: undefined,
    script: "Find a comfortable position and close your eyes. Take a deep breath in through your nose for 4 counts. Hold for 2 counts. Exhale slowly through your mouth for 6 counts. Feel your body relaxing with each breath. Continue this pattern, focusing only on your breath.",
    category: "anxiety"
  },
  {
    id: "body-scan-1",
    title: "Progressive Body Scan",
    description: "A guided body scan to release tension and promote physical relaxation",
    duration: 10,
    audioSrc: undefined,
    script: "Lie down in a comfortable position. Starting at your toes, bring awareness to each part of your body, moving upward. Notice any tension and consciously release it as you exhale. Move from your toes to your feet, legs, hips, abdomen, chest, hands, arms, shoulders, neck, and finally your head.",
    category: "stress"
  },
  {
    id: "sleep-1",
    title: "Bedtime Relaxation",
    description: "A calming exercise to prepare your mind and body for sleep",
    duration: 15,
    audioSrc: undefined,
    script: "Lie comfortably in bed. Take three deep breaths. With each exhale, feel yourself sinking deeper into relaxation. Imagine a peaceful scene - perhaps a beach at sunset or a quiet forest. Engage all your senses in this imagery. What do you see? Hear? Feel? As you continue breathing slowly, allow your body to become heavy and your mind to quiet.",
    category: "sleep"
  },
  {
    id: "focus-1",
    title: "Mindful Awareness",
    description: "A short mindfulness exercise to improve focus and present-moment awareness",
    duration: 7,
    audioSrc: undefined,
    script: "Sit in a comfortable position with your back straight. Focus your attention on your breath, feeling the sensation of air moving in and out of your body. When your mind wanders, gently bring your attention back to your breath without judgment. Notice the thoughts that arise, acknowledge them, and let them pass like clouds in the sky.",
    category: "focus"
  },
  {
    id: "gratitude-1",
    title: "Gratitude Meditation",
    description: "A positive meditation focusing on gratitude and appreciation",
    duration: 8,
    audioSrc: undefined,
    script: "Close your eyes and take a few deep breaths. Bring to mind something or someone you're grateful for. It could be something simple - a warm cup of tea, a kind gesture, or a beautiful sunset. Feel the gratitude in your heart. Notice how this feeling affects your body and mind. Continue bringing to mind things you appreciate, savoring each one.",
    category: "general"
  }
];