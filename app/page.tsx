'use client';

import { useState, useEffect } from 'react';
import { Sparkles, BookOpen, Zap, Download, Star, ArrowRight } from 'lucide-react';
import NoteGenerator from '@/components/NoteGenerator';
import PricingCard from '@/components/PricingCard';

export default function Home() {
  const [userId, setUserId] = useState('');
  const [showGenerator, setShowGenerator] = useState(false);

  useEffect(() => {
    // Generate or retrieve user ID from localStorage
    let id = localStorage.getItem('userId');
    if (!id) {
      id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('userId', id);
    }
    setUserId(id);
  }, []);

  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing');
    pricingSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

        <div className="relative max-w-6xl mx-auto text-center">
          <div className="inline-block mb-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full glass border border-purple-500/30">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-semibold">AI-Powered Study Assistant</span>
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Transform Your Notes into
            <br />
            <span className="gradient-text">Perfect Study Guides</span>
          </h1>

          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Upload any PDF or image and get AI-generated summaries, key concepts,
            practice questions, and memory tips in seconds.
          </p>

          <div className="flex flex-wrap gap-4 justify-center mb-12">
            <button
              onClick={() => setShowGenerator(true)}
              className="btn-primary text-lg px-8 py-4 flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={scrollToPricing}
              className="btn-secondary text-lg px-8 py-4"
            >
              View Pricing
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="card text-center">
              <div className="text-3xl font-bold gradient-text mb-2">3 Free</div>
              <div className="text-gray-400">Documents/Month</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl font-bold gradient-text mb-2">₹0.015</div>
              <div className="text-gray-400">Cost per Document</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl font-bold gradient-text mb-2">98%</div>
              <div className="text-gray-400">Profit Margin</div>
            </div>
          </div>
        </div>
      </section>

      {/* Generator Section */}
      {showGenerator && userId && (
        <section className="py-12 px-6 bg-gradient-to-b from-transparent to-purple-900/10">
          <NoteGenerator userId={userId} />
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">
            Everything You Need to <span className="gradient-text">Study Smarter</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="card hover:scale-105 transition-transform">
              <div className="p-3 rounded-lg bg-purple-500/20 w-fit mb-4">
                <BookOpen className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Summaries</h3>
              <p className="text-gray-400">
                Get concise, comprehensive summaries of your study materials in seconds.
              </p>
            </div>

            <div className="card hover:scale-105 transition-transform">
              <div className="p-3 rounded-lg bg-blue-500/20 w-fit mb-4">
                <Zap className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Key Concepts</h3>
              <p className="text-gray-400">
                Automatically extract and highlight the most important concepts.
              </p>
            </div>

            <div className="card hover:scale-105 transition-transform">
              <div className="p-3 rounded-lg bg-green-500/20 w-fit mb-4">
                <Star className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Practice Questions</h3>
              <p className="text-gray-400">
                Test your knowledge with AI-generated practice questions.
              </p>
            </div>

            <div className="card hover:scale-105 transition-transform">
              <div className="p-3 rounded-lg bg-pink-500/20 w-fit mb-4">
                <Sparkles className="w-8 h-8 text-pink-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Memory Tips</h3>
              <p className="text-gray-400">
                Get mnemonic devices and strategies to remember key information.
              </p>
            </div>

            <div className="card hover:scale-105 transition-transform">
              <div className="p-3 rounded-lg bg-orange-500/20 w-fit mb-4">
                <Download className="w-8 h-8 text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Export Anywhere</h3>
              <p className="text-gray-400">
                Download as PDF, text, or copy to clipboard for easy sharing.
              </p>
            </div>

            <div className="card hover:scale-105 transition-transform">
              <div className="p-3 rounded-lg bg-indigo-500/20 w-fit mb-4">
                <BookOpen className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Definitions</h3>
              <p className="text-gray-400">
                Important terms and their definitions extracted automatically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 bg-gradient-to-b from-purple-900/10 to-transparent">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">
            Simple, <span className="gradient-text">Transparent Pricing</span>
          </h2>
          <p className="text-center text-gray-400 mb-12 text-lg">
            Start free, upgrade when you need more
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <PricingCard
              title="Free"
              price="₹0"
              period="forever"
              features={[
                '3 documents per month',
                'All AI features included',
                'PDF & image support',
                'Export to PDF/text',
                'Copy to clipboard',
              ]}
              onSelect={() => setShowGenerator(true)}
              buttonText="Start Free"
            />

            <PricingCard
              title="Premium"
              price="₹99"
              period="month"
              isPopular
              features={[
                'Unlimited documents',
                'All AI features included',
                'PDF & image support',
                'Export to PDF/text',
                'Priority processing',
                'No ads',
                'Cancel anytime',
              ]}
              onSelect={scrollToPricing}
              buttonText="Upgrade Now"
            />
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-400">
              💡 <span className="font-semibold">Student Tip:</span> Share with 5 friends and get 1 month free!
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-800">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-2xl font-bold gradient-text mb-4">StudyNotes</h3>
          <p className="text-gray-400 mb-6">
            Powered by Claude AI • Built for Students
          </p>
          <p className="text-sm text-gray-500">
            © 2026 StudyNotes. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
