// Mock the 'openai' module before any imports
jest.mock('openai', () => {
  // Mock the constructor and the specific method used
  const mockSpeechCreate = jest.fn().mockResolvedValue({
    // Mimic the structure needed for .arrayBuffer()
    arrayBuffer: jest.fn().mockResolvedValue(Buffer.from('mock audio data')),
  });
  return jest.fn().mockImplementation(() => ({
    audio: {
      speech: {
        create: mockSpeechCreate,
      },
    },
  }));
});

// Import the mocked OpenAI class and the specific mock function after setting up the mock
import OpenAI from 'openai';
// Get a reference to the mock function for assertion checks
const mockOpenAISpeechCreate = new OpenAI().audio.speech.create as jest.Mock;

// Import the enum from the route file to use in tests
import { TherapistType } from './route';

// Define the base URL for the API endpoint
const API_URL = 'http://localhost:3000/api/text-to-speech'; // Adjust port if necessary

describe('/api/text-to-speech POST endpoint', () => {

  beforeEach(() => {
    // Reset mocks before each test
    mockOpenAISpeechCreate.mockClear();
    // Re-mock the implementation to reset its resolved value if needed,
    // but the initial mock should suffice for validation checks.
    mockOpenAISpeechCreate.mockResolvedValue({
      arrayBuffer: jest.fn().mockResolvedValue(Buffer.from('mock audio data')),
    });
  });

  // --- Tests for Invalid Input ---

  it('should return 400 if request body is empty', async () => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toContain('Invalid request body');
    // Check specific Zod error details if necessary
    expect(body.details).toHaveProperty('text');
    expect(body.details).toHaveProperty('therapist');
  });

  it('should return 400 if text is missing', async () => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ therapist: TherapistType.Emma }), // therapist is valid
    });
    expect(response.status).toBe(400);
  });

  it('should return 400 if therapist is missing', async () => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Hello world' }), // text is valid
    });
    expect(response.status).toBe(400);
  });

  it('should return 400 if text is not a string', async () => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 12345, therapist: TherapistType.Emma }),
    });
    expect(response.status).toBe(400);
  });

  it('should return 400 if text is an empty string', async () => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '', therapist: TherapistType.Emma }),
    });
    expect(response.status).toBe(400);
  });

   it('should return 400 if therapist is not a string enum value', async () => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Hello world', therapist: 123 }), // Invalid type
    });
    expect(response.status).toBe(400);
  });

  it('should return 400 if therapist is an invalid enum value', async () => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Hello world',
        therapist: 'INVALID_THERAPIST',
      }),
    });
    expect(response.status).toBe(400);
  });

  // --- Test for Valid Input ---

  it('should return 200 and call OpenAI if request body is valid', async () => {
    const validPayload = {
      text: 'This is valid input text.',
      therapist: TherapistType.Ethan, // Use a valid enum value
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validPayload),
    });

    // Check if the status is successful (2xx)
    expect(response.ok).toBe(true); // Checks for 200-299 status
    expect(response.status).toBe(200);
    // Check content type for the audio file
    expect(response.headers.get('content-type')).toBe('audio/mpeg');

    // Ensure the mocked OpenAI function was called, confirming validation passed
    expect(mockOpenAISpeechCreate).toHaveBeenCalledTimes(1);
    // Optional: Check if OpenAI was called with expected arguments derived from validPayload
    expect(mockOpenAISpeechCreate).toHaveBeenCalledWith(expect.objectContaining({
        model: "tts-1",
        voice: expect.any(String), // Ensure a voice string was passed
        input: validPayload.text, // Ensure the original (or cleaned) text was passed
        speed: 1.0,
    }));
  });

});