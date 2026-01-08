'use client';

import { Download, Copy, Share2, BookOpen, Lightbulb, HelpCircle, Brain } from 'lucide-react';
import { StudyNotes } from '@/lib/claude';
import jsPDF from 'jspdf';

interface NoteViewerProps {
    notes: StudyNotes;
    fileName: string;
}

export default function NoteViewer({ notes, fileName }: NoteViewerProps) {
    const copyToClipboard = () => {
        const text = formatNotesAsText();
        navigator.clipboard.writeText(text);
        alert('Notes copied to clipboard!');
    };

    const formatNotesAsText = () => {
        let text = `Study Notes: ${fileName}\n\n`;
        text += `SUMMARY\n${notes.summary}\n\n`;
        text += `KEY CONCEPTS\n${notes.keyConcepts.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\n`;
        text += `DEFINITIONS\n${notes.definitions.map(d => `• ${d.term}: ${d.definition}`).join('\n')}\n\n`;
        text += `PRACTICE QUESTIONS\n${notes.practiceQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n\n`;
        text += `MEMORY TIPS\n${notes.memoryTips.map((t, i) => `${i + 1}. ${t}`).join('\n')}`;
        return text;
    };

    const downloadAsPDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        let yPosition = 20;

        // Title
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Study Notes', margin, yPosition);
        yPosition += 10;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(fileName, margin, yPosition);
        yPosition += 15;

        // Summary
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Summary', margin, yPosition);
        yPosition += 8;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        const summaryLines = doc.splitTextToSize(notes.summary, pageWidth - 2 * margin);
        doc.text(summaryLines, margin, yPosition);
        yPosition += summaryLines.length * 6 + 10;

        // Key Concepts
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Key Concepts', margin, yPosition);
        yPosition += 8;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        notes.keyConcepts.forEach((concept, i) => {
            const conceptLines = doc.splitTextToSize(`${i + 1}. ${concept}`, pageWidth - 2 * margin);
            if (yPosition + conceptLines.length * 6 > doc.internal.pageSize.getHeight() - 20) {
                doc.addPage();
                yPosition = 20;
            }
            doc.text(conceptLines, margin, yPosition);
            yPosition += conceptLines.length * 6 + 4;
        });

        yPosition += 6;

        // Definitions
        if (yPosition > doc.internal.pageSize.getHeight() - 40) {
            doc.addPage();
            yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Definitions', margin, yPosition);
        yPosition += 8;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        notes.definitions.forEach((def) => {
            const defText = `• ${def.term}: ${def.definition}`;
            const defLines = doc.splitTextToSize(defText, pageWidth - 2 * margin);
            if (yPosition + defLines.length * 6 > doc.internal.pageSize.getHeight() - 20) {
                doc.addPage();
                yPosition = 20;
            }
            doc.text(defLines, margin, yPosition);
            yPosition += defLines.length * 6 + 4;
        });

        yPosition += 6;

        // Practice Questions
        if (yPosition > doc.internal.pageSize.getHeight() - 40) {
            doc.addPage();
            yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Practice Questions', margin, yPosition);
        yPosition += 8;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        notes.practiceQuestions.forEach((q, i) => {
            const qLines = doc.splitTextToSize(`${i + 1}. ${q}`, pageWidth - 2 * margin);
            if (yPosition + qLines.length * 6 > doc.internal.pageSize.getHeight() - 20) {
                doc.addPage();
                yPosition = 20;
            }
            doc.text(qLines, margin, yPosition);
            yPosition += qLines.length * 6 + 4;
        });

        yPosition += 6;

        // Memory Tips
        if (yPosition > doc.internal.pageSize.getHeight() - 40) {
            doc.addPage();
            yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Memory Tips', margin, yPosition);
        yPosition += 8;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        notes.memoryTips.forEach((tip, i) => {
            const tipLines = doc.splitTextToSize(`${i + 1}. ${tip}`, pageWidth - 2 * margin);
            if (yPosition + tipLines.length * 6 > doc.internal.pageSize.getHeight() - 20) {
                doc.addPage();
                yPosition = 20;
            }
            doc.text(tipLines, margin, yPosition);
            yPosition += tipLines.length * 6 + 4;
        });

        doc.save(`${fileName.replace(/\.[^/.]+$/, '')}_notes.pdf`);
    };

    const downloadAsText = () => {
        const text = formatNotesAsText();
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName.replace(/\.[^/.]+$/, '')}_notes.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="w-full space-y-6">
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
                <button onClick={downloadAsPDF} className="btn-primary flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Download PDF
                </button>
                <button onClick={downloadAsText} className="btn-secondary flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Download Text
                </button>
                <button onClick={copyToClipboard} className="btn-secondary flex items-center gap-2">
                    <Copy className="w-4 h-4" />
                    Copy to Clipboard
                </button>
            </div>

            {/* Summary Section */}
            <div className="card">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-blue-500/20">
                        <BookOpen className="w-6 h-6 text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold">Summary</h2>
                </div>
                <p className="text-gray-300 leading-relaxed">{notes.summary}</p>
            </div>

            {/* Key Concepts */}
            <div className="card">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-purple-500/20">
                        <Brain className="w-6 h-6 text-purple-400" />
                    </div>
                    <h2 className="text-2xl font-bold">Key Concepts</h2>
                </div>
                <ul className="space-y-3">
                    {notes.keyConcepts.map((concept, index) => (
                        <li key={index} className="flex gap-3">
                            <span className="text-purple-400 font-semibold">{index + 1}.</span>
                            <span className="text-gray-300">{concept}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Definitions */}
            {notes.definitions.length > 0 && (
                <div className="card">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-green-500/20">
                            <BookOpen className="w-6 h-6 text-green-400" />
                        </div>
                        <h2 className="text-2xl font-bold">Definitions</h2>
                    </div>
                    <div className="space-y-4">
                        {notes.definitions.map((def, index) => (
                            <div key={index} className="border-l-2 border-green-500 pl-4">
                                <h3 className="font-semibold text-green-400 mb-1">{def.term}</h3>
                                <p className="text-gray-300">{def.definition}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Practice Questions */}
            <div className="card">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-orange-500/20">
                        <HelpCircle className="w-6 h-6 text-orange-400" />
                    </div>
                    <h2 className="text-2xl font-bold">Practice Questions</h2>
                </div>
                <ol className="space-y-3">
                    {notes.practiceQuestions.map((question, index) => (
                        <li key={index} className="flex gap-3">
                            <span className="text-orange-400 font-semibold">{index + 1}.</span>
                            <span className="text-gray-300">{question}</span>
                        </li>
                    ))}
                </ol>
            </div>

            {/* Memory Tips */}
            <div className="card">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-pink-500/20">
                        <Lightbulb className="w-6 h-6 text-pink-400" />
                    </div>
                    <h2 className="text-2xl font-bold">Memory Tips</h2>
                </div>
                <ul className="space-y-3">
                    {notes.memoryTips.map((tip, index) => (
                        <li key={index} className="flex gap-3">
                            <span className="text-pink-400 font-semibold">💡</span>
                            <span className="text-gray-300">{tip}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
