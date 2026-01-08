import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        const maxSize = parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '10485760');
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File size exceeds limit (10MB)' },
                { status: 400 }
            );
        }

        const fileType = file.type;

        // Validate file type
        if (fileType === 'application/pdf') {
            return NextResponse.json({
                success: true,
                fileType: 'pdf',
                fileName: file.name,
                message: 'PDF uploaded successfully. Please process on client.',
            });
        } else if (fileType.startsWith('image/')) {
            return NextResponse.json({
                success: true,
                fileType: 'image',
                fileName: file.name,
                message: 'Image uploaded successfully. Please process with OCR on client.',
            });
        } else {
            return NextResponse.json(
                { error: 'Unsupported file type. Please upload PDF or image files.' },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Failed to process file' },
            { status: 500 }
        );
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
};
