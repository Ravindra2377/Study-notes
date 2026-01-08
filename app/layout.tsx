import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudyNotes - AI-Powered Study Guide Generator",
  description: "Transform your PDFs and images into comprehensive study guides with AI. Get summaries, key concepts, practice questions, and memory tips instantly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
