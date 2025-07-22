
import { ai } from '@/ai/genkit';
import { streamToResponse, Message } from 'ai';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages }: { messages: Message[] } = await req.json();

  // The Vercel AI SDK provides the conversation history as an array of messages.
  // We can pass this directly to Genkit.
  const history = messages.slice(0, -1);
  const prompt = messages[messages.length - 1].content;
  
  const { stream } = await ai.generate({
    model: 'googleai/gemini-1.5-flash-latest',
    prompt: prompt,
    history: history,
    system: `You are a helpful assistant for an app called VigiaTemp. 
    Your purpose is to help users with questions about the app, temperature sensors, and cocoa cultivation.
    Be friendly and concise in your answers.`,
    stream: true,
  });

  // Convert the response into a friendly text-stream
  return streamToResponse(stream);
}
