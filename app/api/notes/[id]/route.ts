import { NextRequest, NextResponse } from 'next/server';
import { getNote } from '@/lib/storage';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const noteId = params.id;
        const note = await getNote(noteId);

        if (!note) {
            return NextResponse.json(
                { error: 'Note not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            note,
        });
    } catch (error) {
        console.error('Get note error:', error);
        return NextResponse.json(
            { error: 'Failed to retrieve note' },
            { status: 500 }
        );
    }
}
