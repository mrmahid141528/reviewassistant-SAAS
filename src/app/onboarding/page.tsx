"use client";

import { completeOnboarding } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, CheckCircle2, ArrowRight } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function OnboardingPage() {
    const [isLoading, setIsLoading] = useState(false);

    async function handleLogout() {
        const supabase = createClient();
        await supabase.auth.signOut();
        window.location.href = "/login";
    }

    return (
        <div className="min-h-screen bg-background font-sans flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background elements to match the landing page glassmorphic theme */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] mix-blend-multiply opacity-50 dark:opacity-20 animate-in fade-in duration-1000" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[120px] mix-blend-multiply opacity-70 dark:opacity-20 animate-in fade-in duration-1000 delay-500" />

            <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                        Setup Your Business
                    </h1>
                    <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
                        <LogOut className="h-4 w-4 mr-2" /> Logout
                    </Button>
                </div>

                <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-xl backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-6 text-sm font-medium text-muted-foreground border border-border rounded-full px-4 py-2 bg-muted/30 w-max">
                        <CheckCircle2 className="h-4 w-4 text-primary" /> Just two quick steps
                    </div>

                    <form
                        action={async (formData) => {
                            setIsLoading(true);
                            try {
                                await completeOnboarding(formData);
                            } catch (error) {
                                console.error(error);
                                setIsLoading(false);
                            }
                        }}
                    >
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">What's your Business Name?</label>
                                <Input
                                    name="businessName"
                                    placeholder="e.g. Joe's Coffee Shop"
                                    required
                                    className="h-12 rounded-xl bg-background"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Link your Google Review Page</label>
                                <Input
                                    name="googleUrl"
                                    type="url"
                                    placeholder="https://g.page/r/..."
                                    required
                                    className="h-12 rounded-xl bg-background"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Customers will be automatically redirected here after copying their AI-generated review.
                                </p>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
                                disabled={isLoading}
                            >
                                {isLoading ? "Setting up..." : (
                                    <>Complete Setup <ArrowRight className="h-4 w-4 ml-2" /></>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
