"use client"

import { TherapyResources } from "../therapy-resources"

export default function TestResourcesPage() {
  // Sample messages for testing
  const sampleMessages = [
    { role: "user", content: "I've been feeling anxious lately and having trouble sleeping." },
    { role: "assistant", content: "I'm sorry to hear you're experiencing anxiety and sleep issues. Can you tell me more about what's been causing your anxiety?" },
    { role: "user", content: "I think it's related to work stress and deadlines." }
  ]
  
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test Resources Page</h1>
      <TherapyResources messages={sampleMessages} />
    </div>
  )
} 