
'use server';

import { ai } from '@/ai/genkit';
import { streamToResponse, Message } from 'ai';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages }: { messages: Message[] } = await req.json();

  // Define a prompt for the model
  const prompt = {
    // The history of the conversation so the model has context.
    history: messages,
    // The last message from the user.
    input: messages[messages.length - 1].content,
  };

  const { stream } = await ai.generate({
    model: 'googleai/gemini-1.5-flash-latest',
    prompt: `You are a helpful assistant for an app called VigiaTemp. 
    Your purpose is to help users with questions about the app, temperature sensors, and cocoa cultivation.
    Be friendly and concise in your answers.
    
    Conversation History:
    {{#each history}}
      {{role}}: {{content}}
    {{/each}}

    User Question: {{input}}`,
    // Pass the prompt variables to the template.
    context: prompt,
    stream: true,
  });

  // Convert the response into a friendly text-stream
  return streamToResponse(stream, {
    // Optional headers
    headers: { 'X-VigiaTemp-AI': 'true' },
  });
}
