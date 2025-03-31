// Mock the 'ai' module before any imports
jest.mock('ai', () => ({
  streamText: jest.fn().mockResolvedValue({
    // Return a mock ReadableStream or similar structure if needed
    // For basic validation testing, just resolving might be enough
    // or mocking a simple stream response.
    toAIStream: () => new ReadableStream({
      start(controller) {
        controller.enqueue('Mock AI response');
        controller.close();
      }
    }),
  }),
  // Mock other exports from 'ai' if they were used in the route
  // For example, if specific AI models or providers were imported:
  // google: jest.fn(), // Or whatever provider is used
}));

import { streamText } from 'ai'; // Import after mock

// Define the base URL for the API endpoint
const API_URL = 'http://localhost:3000/api/chat'; // Assuming default port 3000

describe('/api/chat POST endpoint', () => {

  beforeEach(() => {
    // Reset mocks before each test
    (streamText as jest.Mock).mockClear();
    // Potentially re-mock the implementation if needed per test,
    // but the initial mock should suffice for validation checks.
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
  });

  it('should return 400 if messages is missing', async () => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ therapist: 'CARL_ROGERS' }), // therapist is valid
    });
    expect(response.status).toBe(400);
  });

  it('should return 400 if therapist is missing', async () => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'Hello' }] }), // messages are valid
    });
    expect(response.status).toBe(400);
  });

  it('should return 400 if messages is not an array', async () => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: 'not-an-array', therapist: 'CARL_ROGERS' }),
    });
    expect(response.status).toBe(400);
  });

   it('should return 400 if messages array is empty', async () => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [], therapist: 'CARL_ROGERS' }),
    });
    expect(response.status).toBe(400); // Zod schema likely requires non-empty array
  });

  it('should return 400 if message object is missing role', async () => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ content: 'Hello' }], // Missing 'role'
        therapist: 'CARL_ROGERS',
      }),
    });
    expect(response.status).toBe(400);
  });

  it('should return 400 if message object is missing content', async () => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user' }], // Missing 'content'
        therapist: 'CARL_ROGERS',
      }),
    });
    expect(response.status).toBe(400);
  });

   it('should return 400 if message role is invalid', async () => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'invalid-role', content: 'Hello' }],
        therapist: 'CARL_ROGERS',
      }),
    });
    expect(response.status).toBe(400);
  });

  it('should return 400 if therapist is an invalid enum value', async () => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
        therapist: 'INVALID_THERAPIST',
      }),
    });
    expect(response.status).toBe(400);
  });

   it('should return 400 if therapist is not a string', async () => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
        therapist: 12345, // Invalid type
      }),
    });
    expect(response.status).toBe(400);
  });

  // --- Test for Valid Input ---

  it('should return 200 if request body is valid', async () => {
    const validPayload = {
      messages: [
        { role: 'user' as const, content: 'Hello Dr. Rogers' }
      ],
      therapist: 'CARL_ROGERS' as const,
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validPayload),
    });

    // Check if the status is successful (2xx)
    // It should pass validation and hit the mocked streamText
    expect(response.ok).toBe(true); // Checks for 200-299 status
    expect(response.status).toBe(200);

    // Ensure the mocked function was called, confirming validation passed
    expect(streamText).toHaveBeenCalledTimes(1);
    // Optional: Check if streamText was called with expected arguments derived from validPayload
    expect(streamText).toHaveBeenCalledWith(expect.objectContaining({
        // We don't know the exact AI model used without checking route.ts again
        // model: expect.anything(),
        system: expect.any(String), // Check that a system prompt was generated
        messages: validPayload.messages,
    }));
  });

});