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
        let extractedText = '';

        if (fileType === 'application/pdf') {
            // Extract text from PDF on server
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            try {
                // Use pdf-parse-fork which works on Vercel
                // @ts-ignore - No type declarations available
                const pdfParse = (await import('pdf-parse-fork')).default;
                const data = await pdfParse(buffer);
                extractedText = data.text;
            } catch (error) {
                console.error('PDF parsing error:', error);
                return NextResponse.json(
                    { error: 'Failed to parse PDF file. Please try a different file.' },
                    { status: 500 }
                );
            }

            if (!extractedText || extractedText.trim().length < 50) {
                return NextResponse.json(
                    { error: 'Could not extract sufficient text from the PDF' },
                    { status: 400 }
                );
            }

            return NextResponse.json({
                success: true,
                text: extractedText,
                fileName: file.name,
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
