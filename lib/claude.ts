import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export interface StudyNotes {
  summary: string;
  keyConcepts: string[];
  definitions: { term: string; definition: string }[];
  practiceQuestions: string[];
  memoryTips: string[];
}

export async function generateStudyNotes(text: string): Promise<StudyNotes> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  const prompt = `You are an expert study assistant. Analyze the following text and create comprehensive study notes.

Text to analyze:
${text}

Please provide:
1. A concise summary (2-3 sentences)
2. Key concepts (5-7 main ideas)
3. Important definitions (terms and their meanings)
4. Practice questions (5-7 questions to test understanding)
5. Memory tips (mnemonic devices or strategies to remember key points)

Format your response as JSON with this structure:
{
  "summary": "...",
  "keyConcepts": ["...", "..."],
  "definitions": [{"term": "...", "definition": "..."}],
  "practiceQuestions": ["...", "..."],
  "memoryTips": ["...", "..."]
}`;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Extract JSON from the response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse study notes from response');
    }

    const notes: StudyNotes = JSON.parse(jsonMatch[0]);
    return notes;
  } catch (error) {
    console.error('Error generating study notes:', error);
    throw new Error('Failed to generate study notes. Please try again.');
  }
}

export function estimateCost(inputTokens: number, outputTokens: number): number {
  // Claude Sonnet 4.5 pricing: $3 per million input tokens, $15 per million output tokens
  const inputCost = (inputTokens / 1_000_000) * 3;
  const outputCost = (outputTokens / 1_000_000) * 15;
  return inputCost + outputCost;
}
