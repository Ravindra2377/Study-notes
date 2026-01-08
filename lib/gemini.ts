import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface StudyNotes {
    summary: string;
    keyConcepts: string[];
    definitions: { term: string; definition: string }[];
    practiceQuestions: string[];
    memoryTips: string[];
}

export async function generateStudyNotes(text: string): Promise<StudyNotes> {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not configured');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

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
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text();

        // Extract JSON from the response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error('Gemini response:', responseText);
            throw new Error('Could not parse study notes from response');
        }

        const notes: StudyNotes = JSON.parse(jsonMatch[0]);
        return notes;
    } catch (error: any) {
        console.error('Error generating study notes:', error);

        // Provide more specific error messages
        if (error.message?.includes('API key')) {
            throw new Error('GEMINI_API_KEY is not configured or invalid');
        }

        if (error.message?.includes('quota')) {
            throw new Error('Gemini API quota exceeded. Please check your API limits.');
        }

        if (error.message?.includes('parse')) {
            throw new Error('Could not parse study notes from AI response. Please try again.');
        }

        throw new Error(`Failed to generate study notes: ${error.message || 'Unknown error'}`);
    }
}

export function estimateCost(inputTokens: number, outputTokens: number): number {
    // Gemini 1.5 Flash pricing: Free tier available, then $0.075 per million input tokens, $0.30 per million output tokens
    const inputCost = (inputTokens / 1_000_000) * 0.075;
    const outputCost = (outputTokens / 1_000_000) * 0.30;
    return inputCost + outputCost;
}
