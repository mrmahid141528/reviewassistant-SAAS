import React from 'react';
import { Star } from 'lucide-react';
import Link from 'next/link';

export default function OnboardingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            {/* Top Navigation / Header */}
            <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto flex h-16 items-center px-4 md:px-8">
                    <div className="flex items-center gap-2">
                        <Star className="h-6 w-6 text-primary fill-primary" />
                        <span className="font-bold tracking-tight text-lg">Smart Review Assistant</span>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col items-center p-4 py-8 md:py-16">
                <div className="w-full max-w-2xl px-4 md:px-0">
                    {children}
                </div>
            </main>
        </div>
    );
}
