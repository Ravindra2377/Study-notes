'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Image as ImageIcon, X } from 'lucide-react';

interface FileUploadProps {
    onFileSelect: (file: File) => void;
    isProcessing?: boolean;
}

export default function FileUpload({ onFileSelect, isProcessing }: FileUploadProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            setSelectedFile(file);
            onFileSelect(file);
        }
    }, [onFileSelect]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
        },
        maxSize: 10485760, // 10MB
        multiple: false,
        disabled: isProcessing,
    });

    const removeFile = () => {
        setSelectedFile(null);
    };

    return (
        <div className="w-full">
            {!selectedFile ? (
                <div
                    {...getRootProps()}
                    className={`
            border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
            transition-all duration-300 glass
            ${isDragActive
                            ? 'border-purple-500 bg-purple-500/10 scale-105'
                            : 'border-gray-600 hover:border-purple-500/50'
                        }
            ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
          `}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center gap-4">
                        <div className="p-4 rounded-full bg-purple-500/20 animate-float">
                            <Upload className="w-12 h-12 text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold mb-2">
                                {isDragActive ? 'Drop your file here' : 'Upload your study material'}
                            </h3>
                            <p className="text-gray-400">
                                Drag & drop or click to select PDF or image files
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                Maximum file size: 10MB
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-purple-500/20">
                                {selectedFile.type === 'application/pdf' ? (
                                    <FileText className="w-8 h-8 text-purple-400" />
                                ) : (
                                    <ImageIcon className="w-8 h-8 text-purple-400" />
                                )}
                            </div>
                            <div>
                                <h4 className="font-semibold">{selectedFile.name}</h4>
                                <p className="text-sm text-gray-400">
                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                        </div>
                        {!isProcessing && (
                            <button
                                onClick={removeFile}
                                className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                            >
                                <X className="w-5 h-5 text-red-400" />
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
