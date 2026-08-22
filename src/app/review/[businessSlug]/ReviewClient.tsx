"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Store, Star, ArrowRight, Loader2, Copy } from "lucide-react";
import { useParams } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { submitReviewDraft } from './actions';

type FlowState = "WELCOME" | "RATING" | "QUESTIONS" | "GENERATING" | "RESULT";

export default function ReviewClient({ businessName, initialQuestions = [], hasWatermark = false }: { businessName: string, initialQuestions?: any[], hasWatermark?: boolean }) {
    const params = useParams();
    const slug = params?.businessSlug as string;

    const [step, setStep] = useState<FlowState>("WELCOME");
    const [rating, setRating] = useState<number>(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [generatedReview, setGeneratedReview] = useState("");
    const [googleUrl, setGoogleUrl] = useState("");

    const handleStart = () => {
        setStep("RATING");
    };

    const handleRatingSelected = (selectedRating: number) => {
        setRating(selectedRating);
        if (initialQuestions.length > 0) setStep("QUESTIONS");
        else handleFinishQuestions(selectedRating);
    };

    const handleFinishQuestions = async (finalRating = rating) => {
        setStep("GENERATING");

        try {
            const result = await submitReviewDraft(finalRating, answers, slug);

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

                {step === "RATING" && (
                    <div className="w-full animate-in fade-in slide-in-from-right-8 duration-300">
                        <h2 className="text-lg font-semibold mb-6">How would you rate us?</h2>
                        <div className="flex justify-center gap-2 mb-8">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => handleRatingSelected(star)}
                                    className="transition-transform hover:scale-110 active:scale-95"
                                >
                                    <Star
                                        className={`h-10 w-10 ${rating >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === "QUESTIONS" && initialQuestions.length > 0 && (
                    <div className="w-full animate-in fade-in slide-in-from-right-8 duration-300">
                        <div className="flex justify-between items-center mb-4 text-left">
                            <h2 className="text-lg font-semibold">Help us improve</h2>
                            <span className="text-xs font-semibold px-3 py-1 bg-muted rounded-full text-muted-foreground">
                                {currentQuestionIndex + 1} of {initialQuestions.length}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-6 text-left">Your answers will help us generate a complete review for you.</p>

                        <div className="space-y-6 mb-8 text-left">
                            {(() => {
                                const q = initialQuestions[currentQuestionIndex];
                                return (
                                    <div key={q.id} className="animate-in fade-in slide-in-from-right-4 duration-300">
                                        <label className="block text-sm font-medium mb-3">{q.question} {q.required && <span className="text-red-500">*</span>}</label>

                                        {q.options && Array.isArray(q.options) && q.options.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {q.options.map((opt: string) => {
                                                    const cleanOpt = opt.trim();
                                                    const currentAnswers = (answers[q.id] || '').split(',').map(s => s.trim()).filter(Boolean);
                                                    const isSelected = currentAnswers.includes(cleanOpt);

                                                    return (
                                                        <button
                                                            key={opt}
                                                            onClick={() => {
                                                                let nextArr;
                                                                if (isSelected) {
                                                                    nextArr = currentAnswers.filter(o => o !== cleanOpt);
                                                                } else {
                                                                    nextArr = [...currentAnswers, cleanOpt];
                                                                }
                                                                setAnswers({ ...answers, [q.id]: nextArr.join(', ') });
                                                            }}
                                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${isSelected
                                                                ? 'bg-primary text-primary-foreground border-primary shadow-sm ring-1 ring-primary'
                                                                : 'bg-background hover:bg-muted text-foreground'
                                                                }`}
                                                        >
                                                            {opt}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        ) : (
                                            <Textarea
                                                className="resize-none"
                                                placeholder="Your answer..."
                                                value={answers[q.id] || ''}
                                                onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                                            />
                                        )}
                                    </div>
                                );
                            })()}
                        </div>

                        <div className="space-y-4">
                            {currentQuestionIndex < initialQuestions.length - 1 ? (
                                <Button
                                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                                    className="w-full h-12"
                                    size="lg"
                                >
                                    Next Question <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => handleFinishQuestions(rating)}
                                    className="w-full h-12"
                                    size="lg"
                                >
                                    Generate Review
                                </Button>
                            )}

                            {currentQuestionIndex > 0 && (
                                <Button
                                    variant="ghost"
                                    onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                                    className="w-full"
                                >
                                    Back
                                </Button>
                            )}
                        </div>
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

                        <Button variant="ghost" onClick={() => setStep("RATING")} className="w-full mt-2">
                            Start Over
                        </Button>
                    </div>
                )}
            </main>

            {hasWatermark && (
                <footer className="py-4 text-center border-t text-xs text-muted-foreground bg-gray-50/50">
                    Powered by <span className="font-semibold text-gray-700">Google Review Assistant</span>
                </footer>
            )}
        </>
    );
}
