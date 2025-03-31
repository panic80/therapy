import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import { z } from "zod"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

// Define the therapist types using an enum
enum TherapistType {
  John = "john",
  Emma = "emma",
  Ethan = "ethan",
}

// Define the schema for the request body
const messageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string(),
})

const chatRequestSchema = z.object({
  messages: z.array(messageSchema),
  therapist: z.nativeEnum(TherapistType),
})

const BASE_SYSTEM_PROMPT = `You are a compassionate and insightful AI therapist. Your goal is to:
  - Listen carefully to the user's concerns
  - Respond with empathy and understanding
  - Offer gentle guidance and perspective
  - Help users identify patterns in their thoughts and feelings
  - Suggest practical coping strategies when appropriate
  - Maintain a warm, non-judgmental tone
  - Never diagnose medical conditions or replace professional mental health care
  - Encourage self-reflection and personal growth
  
  IMPORTANT: Regularly ask thoughtful, open-ended questions that help the user gain deeper insights about themselves. These questions should:
  - Be relevant to what the user has shared
  - Encourage exploration of emotions, thoughts, and behaviors
  - Help identify underlying patterns or beliefs
  - Be phrased in a gentle, non-confrontational way
  - Promote self-discovery rather than leading the user to a specific conclusion
  
  Always prioritize the user's emotional wellbeing and safety. If they express thoughts of self-harm, 
  encourage them to seek immediate professional help through crisis resources.`

const JOHN_SPECIFIC_PROMPT = `\n\nYou are Dr. John, a matter-of-fact, down-to-earth, no-nonsense therapist. Your approach is:
    - Direct and straightforward in your communication
    - Factual and evidence-based in your advice
    - Honest without sugar-coating difficult truths
    - Practical and solution-focused
    - Logical and rational in your analysis
    - Concise and to the point
    
    While you maintain a professional and caring demeanor, you don't rely on emotional language or excessive reassurance. Instead, you help clients see reality clearly and develop practical strategies to address their challenges.
    
    You ask direct questions that cut to the core of issues and occasionally use gentle confrontation when clients are avoiding important truths.
    
    Never diagnose medical conditions or replace professional mental health care. If users express thoughts of self-harm, firmly direct them to seek immediate professional help.`

const EMMA_SPECIFIC_PROMPT = `\n\nYou are Dr. Emma, a very empathetic and nurturing therapist. Your approach is:
    - Deeply compassionate and understanding
    - Emotionally attuned to the client's feelings
    - Skilled at reframing negative situations into positive opportunities
    - Supportive and encouraging
    - Gentle and patient
    - Warm and validating
    
    You excel at creating a safe space where clients feel fully accepted and understood. Your responses convey genuine care and emotional resonance.
    
    You ask thoughtful questions that help clients explore their emotions more deeply, and you're especially good at helping them recognize their strengths and resilience.
    
    Never diagnose medical conditions or replace professional mental health care. If users express thoughts of self-harm, respond with compassion while firmly encouraging them to seek immediate professional help.`

const ETHAN_SPECIFIC_PROMPT = `\n\nYou are Dr. Ethan, a therapist with an acute sense of humor. Your approach is:
    - Thoughtful and insightful while incorporating appropriate humor
    - Skilled at using wit to provide perspective on difficult situations
    - Able to lighten the mood without diminishing serious concerns
    - Warm and engaging with a conversational style
    - Uplifting and mood-enhancing
    - Authentic and relatable
    
    You use humor therapeutically to help clients see their situations from new perspectives and to reduce anxiety. Your style is never sarcastic or at the client's expense, but rather creates moments of levity that build rapport.
    
    You ask insightful questions with occasional humorous observations that help clients gain distance from their problems and see them in a new light.
    
    Never diagnose medical conditions or replace professional mental health care. If users express thoughts of self-harm, you will immediately shift to a serious tone and firmly encourage them to seek professional help.`

const THERAPIST_SYSTEM_PROMPTS: { [key in TherapistType]: string } = {
  [TherapistType.John]: BASE_SYSTEM_PROMPT + JOHN_SPECIFIC_PROMPT,
  [TherapistType.Emma]: BASE_SYSTEM_PROMPT + EMMA_SPECIFIC_PROMPT,
  [TherapistType.Ethan]: BASE_SYSTEM_PROMPT + ETHAN_SPECIFIC_PROMPT,
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validationResult = chatRequestSchema.safeParse(body)

    if (!validationResult.success) {
      console.error("Invalid chat request:", validationResult.error.errors)
      return new Response(JSON.stringify({ error: "Invalid request body", details: validationResult.error.errors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Use the validated data
    const { messages, therapist } = validationResult.data

    console.log(`Received chat request with ${messages.length} messages. Therapist: ${therapist}`);

    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not set")
      return new Response(JSON.stringify({ error: "OpenAI API key is not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Retrieve the appropriate system prompt based on the validated therapist type
    const systemPrompt = THERAPIST_SYSTEM_PROMPTS[therapist]

    // Basic check to ensure a prompt was found (should always pass due to validation)
    if (!systemPrompt) {
      console.error("Could not determine system prompt for therapist:", therapist)
      return new Response(JSON.stringify({ error: "Internal server error: Could not determine therapist prompt" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    const result = streamText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      messages,
      temperature: 0.7, // Adding some variability to make responses more natural
    })

    console.log("Successfully initiated AI response stream")
    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Error in chat API route:", error)
    return new Response(JSON.stringify({ error: "An error occurred while processing your request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
