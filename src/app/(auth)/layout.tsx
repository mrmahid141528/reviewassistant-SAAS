import React from 'react';
import { Star, CheckCircle2 } from 'lucide-react';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // We removed the forced "dark" class and inline style so this matches the actual website theme
    return (
        <div className="flex min-h-screen bg-background text-foreground selection:bg-primary/30">
            {/* Left Section - Branding (Hidden on mobile, 55% width on desktop) */}
            <div className="hidden lg:flex w-[55%] bg-card border-r border-border flex-col relative overflow-hidden">
                {/* Background glow effects */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute -top-1/4 -left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl opacity-50" />
                    <div className="absolute -bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl opacity-50" />
                </div>

                <div className="relative z-10 flex flex-col h-full p-12 overflow-y-auto">
                    {/* Logo & Headline */}
                    <div className="flex items-center gap-2 mb-12">
                        <Star className="w-8 h-8 text-primary fill-primary" />
                        <span className="font-bold tracking-tight text-xl text-foreground">Smart Review Assistant</span>
                    </div>

                    <div className="mt-8 max-w-lg flex-1">
                        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]">
                            Turn Happy Customers<br />Into Powerful Reviews.
                        </h1>
                        <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
                            Create authentic, AI-powered reviews and make it easier for your customers to share their experience.
                        </p>

                        <div className="space-y-6 mb-12">
                            <div className="flex items-start gap-4">
                                <div className="mt-1 bg-primary/10 p-1.5 rounded-full">
                                    <CheckCircle2 className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground">AI-Powered Reviews</h3>
                                    <p className="text-muted-foreground text-sm mt-1">Generate natural and personalized reviews automatically.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="mt-1 bg-primary/10 p-1.5 rounded-full">
                                    <CheckCircle2 className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground">QR Code Experience</h3>
                                    <p className="text-muted-foreground text-sm mt-1">Let customers start reviewing in seconds with custom codes.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="mt-1 bg-primary/10 p-1.5 rounded-full">
                                    <CheckCircle2 className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground">Grow Your Reputation</h3>
                                    <p className="text-muted-foreground text-sm mt-1">Make it easier to collect valuable customer feedback at scale.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dashboard Preview Mockup */}
                    <div className="mt-auto bg-background border border-border rounded-xl p-6 shadow-2xl relative translate-y-8 hover:translate-y-6 transition-transform duration-500">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                            <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                            <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                        </div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                            </div>
                            <div>
                                <h4 className="text-foreground font-medium">Review Assistant</h4>
                                <div className="flex items-center gap-1 text-yellow-500 text-xs mt-0.5">
                                    <Star className="w-3 h-3 fill-yellow-500" />
                                    <Star className="w-3 h-3 fill-yellow-500" />
                                    <Star className="w-3 h-3 fill-yellow-500" />
                                    <Star className="w-3 h-3 fill-yellow-500" />
                                    <Star className="w-3 h-3 fill-yellow-500" />
                                    <span className="text-muted-foreground font-medium ml-1">4.8 Rating</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-foreground/80 text-sm italic mb-4 leading-relaxed">
                            "The service was excellent and the staff was extremely helpful. I would highly recommend them to anyone looking for quality work."
                        </p>
                        <div className="w-full h-10 bg-muted hover:bg-muted/80 cursor-pointer transition-colors rounded-lg flex items-center justify-center text-sm font-medium text-foreground shadow-sm border border-border">
                            Copy Review
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Section - Auth Form (100% width on mobile, 45% on desktop) */}
            <div className="flex-1 flex w-full lg:w-[45%] flex-col relative bg-background">
                <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 w-full">
                    {/* Mobile Header (Hidden on Desktop) */}
                    <div className="lg:hidden flex items-center justify-center gap-2 mb-8 w-full max-w-[420px]">
                        <Star className="w-6 h-6 text-primary fill-primary" />
                        <span className="font-bold tracking-tight text-foreground">Smart Review Assistant</span>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
