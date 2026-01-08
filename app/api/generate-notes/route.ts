```typescript
import { NextRequest, NextResponse } from 'next/server';
import { generateStudyNotes } from '@/lib/gemini';
import { getUserUsage, incrementUsage, saveNote } from '@/lib/storage';

export async function POST(request: NextRequest) {
    try {
        const { text, fileName, userId } = await request.json();

        if (!text || !fileName || !userId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check user usage limits
        const usage = await getUserUsage(userId);
        const freeLimit = parseInt(process.env.NEXT_PUBLIC_FREE_TIER_LIMIT || '3');

        if (!usage.isPremium && usage.documentsProcessed >= freeLimit) {
            return NextResponse.json(
                {
                    error: 'Free tier limit reached',
                    limitReached: true,
                    documentsProcessed: usage.documentsProcessed,
                    limit: freeLimit,
                },
                { status: 403 }
            );
        }

        // Generate study notes using Claude
        const notes = await generateStudyNotes(text);

        // Save the notes
        const noteId = await saveNote(userId, fileName, notes);

        // Increment usage counter
        await incrementUsage(userId);

        // Get updated usage
        const updatedUsage = await getUserUsage(userId);

        return NextResponse.json({
            success: true,
            noteId,
            notes,
            usage: {
                documentsProcessed: updatedUsage.documentsProcessed,
                limit: freeLimit,
                isPremium: updatedUsage.isPremium,
                remaining: updatedUsage.isPremium ? 'unlimited' : Math.max(0, freeLimit - updatedUsage.documentsProcessed),
            },
        });
    } catch (error: any) {
        console.error('Generate notes error:', error);

        if (error.message?.includes('ANTHROPIC_API_KEY')) {
            return NextResponse.json(
                { error: 'AI service not configured. Please add your API key.' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: error.message || 'Failed to generate study notes' },
            { status: 500 }
        );
    }
}
