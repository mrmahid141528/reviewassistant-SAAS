"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Store, Star, ArrowRight, Loader2, Copy } from "lucide-react";
import { useParams } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { submitReviewDraft } from './actions';

type FlowState = "WELCOME" | "QUESTIONS" | "GENERATING" | "RESULT";

export default function ReviewClient({ businessName }: { businessName: string }) {
    const params = useParams();
    const slug = params?.businessSlug as string;

    const [step, setStep] = useState<FlowState>("WELCOME");
    const [rating, setRating] = useState<number>(0);
    const [generatedReview, setGeneratedReview] = useState("");
    const [googleUrl, setGoogleUrl] = useState("");

    const handleStart = () => {
        setStep("QUESTIONS");
    };

    const handleFinishQuestions = async () => {
        setStep("GENERATING");

        try {
            const result = await submitReviewDraft(rating, slug);

            if (result.success && result.draft) {
                setGeneratedReview(result.draft);
                setGoogleUrl(result.googleUrl || "");
                setStep("RESULT");
            } else {
                alert("AI Error: " + result.error);
                setStep("QUESTIONS");
            }
        } catch (e: unknown) {
            alert("Error: " + (e instanceof Error ? e.message : 'Unknown error'));
            setStep("QUESTIONS");
        }
    };

    const copyAndContinue = () => {
        navigator.clipboard.writeText(generatedReview);
        if (googleUrl) {
            window.location.href = googleUrl;
        } else {
            alert("Review copied! (No Google link configured by the business)");
        }
    };

    return (
        <>
            <header className="bg-primary/5 p-6 text-center border-b">
                <Store className="h-10 w-10 text-primary mx-auto mb-2" />
                <h1 className="text-xl font-bold tracking-tight">{businessName}</h1>
                <p className="text-sm text-muted-foreground mt-1">We value your feedback!</p>
            </header>

            <main className="flex-1 p-6 flex flex-col items-center justify-center">
                {step === "WELCOME" && (
                    <div className="text-center w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-lg font-semibold mb-2">How was your visit?</h2>
                        <p className="text-muted-foreground text-sm mb-8">
                            Answer 3 quick questions and our assistant will write a great review for you to share on Google.
                        </p>
                        <Button onClick={handleStart} size="lg" className="w-full gap-2 text-md">
                            Start Review <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}

                {step === "QUESTIONS" && (
                    <div className="w-full animate-in fade-in slide-in-from-right-8 duration-300">
                        <h2 className="text-lg font-semibold mb-6">How would you rate us?</h2>
                        <div className="flex justify-center gap-2 mb-8">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    className="transition-transform hover:scale-110 active:scale-95"
                                >
                                    <Star
                                        className={`h-10 w-10 ${rating >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                    />
                                </button>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <Button
                                onClick={handleFinishQuestions}
                                className="w-full"
                                size="lg"
                                disabled={rating === 0}
                            >
                                Generate Review
                            </Button>
                        </div>

                        <p className="text-xs text-center text-muted-foreground mt-6">
                            Step 1 of 1
                        </p>
                    </div>
                )}

                {step === "GENERATING" && (
                    <div className="text-center w-full animate-in fade-in zoom-in-95 duration-500">
                        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
                        <h2 className="text-lg font-semibold">Writing your review...</h2>
                        <p className="text-sm text-muted-foreground mt-2">
                            Using your answers to craft a natural review.
                        </p>
                    </div>
                )}

                {step === "RESULT" && (
                    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-lg font-semibold mb-2 text-emerald-600 flex items-center gap-2">
                            <Star className="fill-emerald-600 h-5 w-5" /> Review Draft Ready
                        </h2>
                        <p className="text-sm text-muted-foreground mb-4">
                            You can edit this draft before copying it.
                        </p>

                        <Textarea
                            value={generatedReview}
                            onChange={(e) => setGeneratedReview(e.target.value)}
                            className="min-h-[160px] text-base p-4 resize-none focus-visible:ring-emerald-500 mb-6"
                        />

                        <Button onClick={copyAndContinue} size="lg" className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 items-center justify-center h-14 text-lg">
                            <Copy className="h-5 w-5" /> Copy & Continue to Google
                        </Button>

                        <Button variant="ghost" onClick={() => setStep("QUESTIONS")} className="w-full mt-2">
                            Start Over
                        </Button>
                    </div>
                )}
            </main>
        </>
    );
}
