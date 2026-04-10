import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { AI_MODEL } from '@/app/lib/ai-client';

const groq = createGroq({
  apiKey: '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',
});

export async function GET() {
  try {

    // Try a simple generation
    const { text } = await generateText({
      model: groq(AI_MODEL),
      prompt: 'Say "Hello from Groq!"',
    });

    return NextResponse.json({
      success: true,
      message: text,
      apiKeyConfigured: true,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('AI Test error:', error);
    return NextResponse.json(
      { error: 'AI Test failed', details: errorMessage },
      { status: 500 }
    );
  }
}
