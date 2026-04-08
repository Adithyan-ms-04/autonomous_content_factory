// Vercel AI SDK client configuration - Using Groq
import { createGroq } from '@ai-sdk/groq';
import { generateText } from 'ai';

export const AI_MODEL = 'openai/gpt-oss-120b';

// Initialize the groq provider
const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

// Standard text generation wrapper
export async function generateWithAI(prompt: string, maxTokens: number = 4096) {
  try {
    const { text } = await generateText({
      model: groq(AI_MODEL),
      prompt,
    });

    return text;
  } catch (error) {
    console.error('AI generation error:', error);
    throw error;
  }
}

// Export model for use with generateObject in agents
export const getGroqModel = () => groq(AI_MODEL);
