import React from 'react';
import { Star } from 'lucide-react';
import Link from 'next/link';
import { getBrandSettings } from '@/lib/brand';

export default async function OnboardingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const brandSettings = await getBrandSettings();
    return (
        <div className="flex flex-col min-h-screen relative overflow-hidden bg-[#fdfdfd] text-foreground">
            {/* Elegant CSS Background Waves */}
            <div className="absolute inset-x-0 inset-y-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/40 via-white to-amber-50/30" />
                <div className="absolute inset-0 opacity-60" style={{ background: 'radial-gradient(ellipse at 80% 20%, rgba(99, 102, 241, 0.1), transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(249, 115, 22, 0.05), transparent 50%)' }} />

                {/* Beautiful CSS overlapping waves */}
                <svg className="absolute w-full h-[150%] top-[-25%] left-0 opacity-[0.4]" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0,45 C30,75 70,15 100,55 L100,100 L0,100 Z" fill="rgba(255,255,255,0.6)" stroke="none" />
                    <path d="M0,40 C30,70 70,10 100,50" fill="none" stroke="#eab308" strokeWidth="0.15" />
                    <path d="M0,60 C40,20 60,80 100,40" fill="none" stroke="#6366f1" strokeWidth="0.1" />
                    <path d="M0,50 C50,90 80,30 100,70" fill="none" stroke="#eab308" strokeWidth="0.05" />
                </svg>
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Top Navigation / Header */}
                <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-white/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/40 shadow-sm">
                    <div className="container mx-auto flex h-16 items-center px-4 md:px-8">
                        <div className="flex items-center gap-2">
                            {brandSettings?.logoUrl ? (
                                <div className="flex items-center h-16 w-auto">
                                    <img src={brandSettings.logoUrl} alt="Platform Logo" className="h-full object-contain max-h-16 w-auto drop-shadow-sm" />
                                </div>
                            ) : (
                                <>
                                    <Star className="h-6 w-6 text-primary fill-primary" />
                                    <span className="font-bold tracking-tight text-lg">{brandSettings?.platformName || 'Smart Review Assistant'}</span>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col items-center p-4 py-8 md:py-16 relative z-10 w-full">
                    <div className="w-full max-w-4xl px-4 md:px-0">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
