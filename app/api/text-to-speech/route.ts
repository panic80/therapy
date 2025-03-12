import OpenAI from "openai"

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Map therapist to voice
const getVoiceForTherapist = (therapist?: string): string => {
  switch(therapist) {
    case 'john': 
      return 'onyx'
    case 'emma': 
      return 'nova'
    case 'ethan': 
      return 'alloy'
    default: 
      return 'nova' // Default voice
  }
}

export async function POST(req: Request) {
  try {
    // Parse the request body
    let text
    let therapist
    try {
      const body = await req.json()
      text = body.text
      therapist = body.therapist
    } catch (parseError) {
      console.error("Error parsing request body:", parseError)
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    console.log("Text-to-speech request received, length:", text?.length, "therapist:", therapist)

    if (!text || typeof text !== "string") {
      return new Response(JSON.stringify({ error: "Text is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not set")
      return new Response(JSON.stringify({ error: "OpenAI API key is not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Get the appropriate voice for this therapist
    const voice = getVoiceForTherapist(therapist)

    // More aggressive text cleaning to avoid API errors
    // Remove problematic characters and normalize whitespace
    const cleanedText = text
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Remove control characters
      .replace(/[\u2028\u2029]/g, " ") // Replace line/paragraph separators with spaces
      .replace(/[^\p{L}\p{N}\p{P}\p{Z}]/gu, "") // Keep only letters, numbers, punctuation, and spaces
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim()

    // Further limit text length to be safe
    const truncatedText = cleanedText.length > 1000 ? cleanedText.substring(0, 1000) + "..." : cleanedText

    console.log("Cleaned text length:", truncatedText.length, "using voice:", voice)

    try {
      console.log("Calling OpenAI TTS API...")

      // Generate speech using OpenAI SDK directly, following their documentation
      const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: voice,
        input: truncatedText,
        speed: 1.0,
      })

      console.log("OpenAI TTS API call successful")

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
        JSON.stringify({
          error: "Failed to generate speech",
          details: {
            message: errorMessage,
            type: errorType,
            status: statusCode,
          },
        }),
        {
          status: statusCode,
          headers: { "Content-Type": "application/json" },
        },
      )
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

