'use client';

import { useState } from 'react';
import { Loader2, Sparkles, AlertCircle } from 'lucide-react';
import FileUpload from './FileUpload';
import NoteViewer from './NoteViewer';
import { StudyNotes } from '@/lib/claude';
import { createWorker } from 'tesseract.js';

interface NoteGeneratorProps {
    userId: string;
}

export default function NoteGenerator({ userId }: NoteGeneratorProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusMessage, setStatusMessage] = useState('');
    const [notes, setNotes] = useState<StudyNotes | null>(null);
    const [fileName, setFileName] = useState('');
    const [error, setError] = useState('');
    const [limitReached, setLimitReached] = useState(false);

    const handleFileSelect = async (selectedFile: File) => {
        setFile(selectedFile);
        setError('');
        setNotes(null);
        setLimitReached(false);
    };

    const processFile = async () => {
        if (!file) return;

        setIsProcessing(true);
        setProgress(10);
        setStatusMessage('Processing file...');
        setError('');

        try {
            let extractedText = '';

            if (file.type === 'application/pdf') {
                // Extract text from PDF on client side using pdfjs-dist
                setProgress(20);
                setStatusMessage('Extracting text from PDF...');

                const arrayBuffer = await file.arrayBuffer();

                // Dynamic import to avoid SSR issues
                const pdfjsLib = await import('pdfjs-dist');

                // Use unpkg CDN for worker (more reliable)
                pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                const numPages = pdf.numPages;

                for (let i = 1; i <= numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items
                        .map((item: any) => item.str)
                        .join(' ');
                    extractedText += pageText + '\n';
                    setProgress(20 + (i / numPages) * 30);
                }
            } else if (file.type.startsWith('image/')) {
                // Use Tesseract.js for OCR on client side
                setProgress(20);
                setStatusMessage('Performing OCR on image...');

                const worker = await createWorker('eng');
                const { data } = await worker.recognize(file);
                extractedText = data.text;
                await worker.terminate();
            }

            if (!extractedText || extractedText.trim().length < 50) {
                throw new Error('Could not extract sufficient text from the file');
            }

            setProgress(50);
            setStatusMessage('Generating study notes with AI...');

            // Generate notes
            const generateResponse = await fetch('/api/generate-notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: extractedText,
                    fileName: file.name,
                    userId,
                }),
            });

            const generateData = await generateResponse.json();

            if (!generateResponse.ok) {
                if (generateData.limitReached) {
                    setLimitReached(true);
                    throw new Error(
                        `You've reached your free tier limit of ${generateData.limit} documents this month. Upgrade to premium for unlimited access!`
                    );
                }
                throw new Error(generateData.error || 'Failed to generate notes');
            }

            setProgress(100);
            setStatusMessage('Notes generated successfully!');
            setNotes(generateData.notes);
            setFileName(file.name);

            // Show usage info
            if (!generateData.usage.isPremium) {
                const remaining = generateData.usage.remaining;
                if (remaining === 0) {
                    setLimitReached(true);
                }
            }
        } catch (err: any) {
            console.error('Processing error:', err);
            setError(err.message || 'An error occurred while processing your file');
            setProgress(0);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            {!notes ? (
                <>
                    <FileUpload onFileSelect={handleFileSelect} isProcessing={isProcessing} />

                    {file && !isProcessing && (
                        <button
                            onClick={processFile}
                            className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-4"
                        >
                            <Sparkles className="w-5 h-5" />
                            Generate Study Notes
                        </button>
                    )}

                    {isProcessing && (
                        <div className="card">
                            <div className="flex flex-col items-center gap-4">
                                <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
                                <div className="w-full">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm text-gray-400">{statusMessage}</span>
                                        <span className="text-sm text-purple-400">{progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-500"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="card border-red-500/50 bg-red-500/10">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-red-400 mb-1">Error</h3>
                                    <p className="text-gray-300">{error}</p>
                                    {limitReached && (
                                        <button
                                            onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                                            className="btn-primary mt-4"
                                        >
                                            Upgrade to Premium
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-bold gradient-text">Your Study Notes</h2>
                        <button
                            onClick={() => {
                                setNotes(null);
                                setFile(null);
                                setError('');
                                setProgress(0);
                            }}
                            className="btn-secondary"
                        >
                            Generate New Notes
                        </button>
                    </div>
                    <NoteViewer notes={notes} fileName={fileName} />
                </div>
            )}
        </div>
    );
}
