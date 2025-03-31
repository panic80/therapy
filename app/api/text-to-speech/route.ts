import OpenAI from "openai"
import { z } from "zod"
import { cleanAndTruncateText } from "@/app/utils/text-processing";
import { SpeechCreateParams } from "openai/resources/audio/speech.mjs";

// Define TherapistType enum (assuming it's not imported from a shared location)
export enum TherapistType {
  John = "john",
  Emma = "emma",
  Ethan = "ethan",
}

// Define Voice ID constants
const JOHN_VOICE_ID = 'onyx';
const EMMA_VOICE_ID = 'nova';
const ETHAN_VOICE_ID = 'alloy';

// Define the allowed voice type based on OpenAI SDK
type OpenAIVoice = SpeechCreateParams['voice'];

// Map therapist enum to voice ID constants
const voiceMap: { [key in TherapistType]: OpenAIVoice } = {
  [TherapistType.John]: JOHN_VOICE_ID,
  [TherapistType.Emma]: EMMA_VOICE_ID,
  [TherapistType.Ethan]: ETHAN_VOICE_ID,
};

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Define the Zod schema for input validation
const TextToSpeechSchema = z.object({
  text: z.string().min(1, { message: "Text cannot be empty" }),
  therapist: z.nativeEnum(TherapistType, {
    errorMap: () => ({ message: "Invalid therapist selection" }),
  }),
})

export async function POST(req: Request) {
  try {
    // Parse and validate the request body using Zod
    try {
      const body = await req.json()
      const validationResult = TextToSpeechSchema.safeParse(body)

      if (!validationResult.success) {
        console.error("Input validation failed:", validationResult.error.flatten())
        return new Response(
          JSON.stringify({
            error: "Invalid request body",
            details: validationResult.error.flatten().fieldErrors,
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        )
      }

      const { text, therapist } = validationResult.data

      console.log("Text-to-speech request received, length:", text?.length, "therapist:", therapist)

      // Get the appropriate voice for this therapist
      // Use the voiceMap, defaulting to EMMA_VOICE_ID if therapist is somehow invalid (though Zod should prevent this)
      const voice = voiceMap[therapist] ?? EMMA_VOICE_ID;

      // Clean and truncate the text using the utility function
      const truncatedText = cleanAndTruncateText(text);

      console.log("Cleaned text length:", truncatedText.length, "using voice:", voice)

      try {
        console.log("Calling OpenAI TTS API...")
        console.time("OpenAI TTS API Call Duration") // Start timer

        // Generate speech using OpenAI SDK directly, following their documentation
        const mp3 = await openai.audio.speech.create({
          model: "tts-1",
          voice: voice,
          input: truncatedText,
          speed: 1.0,
        })

        console.log("OpenAI TTS API call successful")
        console.timeEnd("OpenAI TTS API Call Duration") // End timer and log duration

        // Convert the response to a Buffer as shown in OpenAI's example
        const buffer = Buffer.from(await mp3.arrayBuffer())

        console.log("Speech generated successfully, audio size:", buffer.length)

        // Return the audio as a response
        return new Response(buffer, {
          headers: {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "public, max-age=3600", // Cache for 1 hour
          },
        })
      } catch (speechError: any) {
        console.error("OpenAI speech generation error:", speechError)

        // Extract detailed error information
        const errorMessage = speechError.message || "Unknown error"
        const statusCode = speechError.status || 500
        const errorType = speechError.type || "unknown_error"

        // Log more details for debugging
        console.error("Error details:", {
          message: errorMessage,
          type: errorType,
          status: statusCode,
          details: speechError.toString(),
        })

        // Return a more detailed error response
        return new Response(
          JSON.stringify({ error: "Failed to generate speech. Please try again later." }),
          {
            status: statusCode,
            headers: { "Content-Type": "application/json" },
          },
        )
      }
    } catch (jsonParseError: any) { // Catch JSON parsing errors specifically
      console.error("Error parsing request JSON:", jsonParseError)
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }
  } catch (error: any) {
    console.error("Error in text-to-speech API route:", error)

    // Ensure we return a proper JSON error response
    return new Response(
      JSON.stringify({
        error: "An error occurred while processing your request",
        details: error.message || "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

