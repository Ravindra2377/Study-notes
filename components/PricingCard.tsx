'use client';

import { Check } from 'lucide-react';

interface PricingCardProps {
    title: string;
    price: string;
    period?: string;
    features: string[];
    isPopular?: boolean;
    onSelect: () => void;
    buttonText?: string;
}

export default function PricingCard({
    title,
    price,
    period,
    features,
    isPopular,
    onSelect,
    buttonText = 'Get Started',
}: PricingCardProps) {
    return (
        <div
            className={`
        card relative overflow-hidden
        ${isPopular ? 'border-2 border-purple-500 animate-glow' : ''}
      `}
        >
            {isPopular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                    Most Popular
                </div>
            )}

            <div className="mt-4">
                <h3 className="text-2xl font-bold mb-2">{title}</h3>
                <div className="mb-6">
                    <span className="text-4xl font-bold gradient-text">{price}</span>
                    {period && <span className="text-gray-400 ml-2">/{period}</span>}
                </div>

                <ul className="space-y-3 mb-8">
                    {features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                            <div className="p-1 rounded-full bg-green-500/20 mt-0.5">
                                <Check className="w-4 h-4 text-green-400" />
                            </div>
                            <span className="text-gray-300">{feature}</span>
                        </li>
                    ))}
                </ul>

                <button
                    onClick={onSelect}
                    className={`
            w-full py-3 rounded-lg font-semibold transition-all duration-300
            ${isPopular
                            ? 'btn-primary'
                            : 'btn-secondary'
                        }
          `}
                >
                    {buttonText}
                </button>
            </div>
        </div>
    );
}
