"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Store, Star, ArrowRight, Loader2, Copy, Clock, Lock } from "lucide-react";
import { useParams } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { submitReviewDraft } from './actions';

type FlowState = "WELCOME" | "QUESTIONS" | "GENERATING" | "RESULT";

export default function ReviewClient({ businessName, businessLogo, initialQuestions = [], hasWatermark = false }: { businessName: string, businessLogo?: string | null, initialQuestions?: any[], hasWatermark?: boolean }) {
    const params = useParams();
    const slug = params?.businessSlug as string;

    const [step, setStep] = useState<FlowState>("WELCOME");
    const [rating, setRating] = useState<number>(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [generatedReview, setGeneratedReview] = useState("");
    const [googleUrl, setGoogleUrl] = useState("");

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
            let finalUrl = googleUrl.trim();
            if (!/^https?:\/\//i.test(finalUrl)) {
                finalUrl = 'https://' + finalUrl;
            }
            window.location.href = finalUrl;
        } else {
            alert("Review copied! (No Google link configured by the business)");
        }
    };

    const continueFromWelcome = () => {
        if (rating === 0) {
            alert("Please select a rating to continue!");
            return;
        }
        if (initialQuestions.length > 0) setStep("QUESTIONS");
        else handleFinishQuestions(rating);
    };

    return (
        <div className="min-h-[100dvh] md:min-h-screen bg-[#FDFCFE] md:bg-slate-50 flex flex-col relative overflow-hidden font-sans sm:py-10">
            {/* Background Gradient Blobs */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-100 rounded-full mix-blend-multiply blur-[80px] opacity-60 translate-x-1/3 -translate-y-1/3 pointer-events-none hidden md:block"></div>
            <div className="absolute top-[20%] left-0 w-[300px] h-[300px] bg-indigo-50 rounded-full mix-blend-multiply blur-[80px] opacity-70 -translate-x-1/2 pointer-events-none hidden md:block"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-100/50 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3 pointer-events-none hidden md:block"></div>

            <main className="flex-1 w-full max-w-md mx-auto relative z-10 flex flex-col pt-4 sm:pt-10 pb-4 sm:pb-6 px-4 sm:px-6 md:bg-white md:rounded-[40px] md:shadow-[0_20px_60px_rgba(0,0,0,0.05)] md:border md:border-slate-100 md:h-fit md:my-auto md:overflow-hidden md:flex-initial">

                {step === "WELCOME" && (
                    <div className="flex-1 flex flex-col items-center justify-between animate-in fade-in zoom-in-95 duration-500 min-h-[0]">
                        <div className="flex flex-col items-center w-full">
                            {/* Logo Mockup */}
                            <div className="w-[75px] h-[75px] sm:w-[90px] sm:h-[90px] mb-3 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center relative border border-slate-100 overflow-hidden shrink-0">
                                {businessLogo ? (
                                    <img src={businessLogo} alt={businessName} className="w-full h-full object-contain p-1" />
                                ) : (
                                    <Store className="w-7 h-7 sm:w-10 sm:h-10 text-slate-800" />
                                )}
                            </div>

                            {/* Business Name Header */}
                            <h1 className="text-[20px] sm:text-[26px] font-extrabold text-[#0D0B3D] text-center tracking-tight leading-none mb-1">
                                {businessName}
                            </h1>
                            <p className="text-[#B88E2F] font-bold text-[15px] sm:text-[20px] tracking-wide mb-3">
                                Internet Cafe
                            </p>

                            {/* Divider with gold dot */}
                            <div className="flex items-center justify-center w-full max-w-[180px] mb-5">
                                <div className="h-[1px] bg-slate-200 flex-1"></div>
                                <div className="w-[6px] h-[6px] rounded-full bg-[#D4AF37] mx-3 shrink-0"></div>
                                <div className="h-[1px] bg-slate-200 flex-1"></div>
                            </div>

                            {/* Main Prompt */}
                            <h2 className="text-[30px] sm:text-[40px] font-extrabold text-[#0D0B3D] text-center tracking-tight leading-tight">
                                How was your<br />
                                <span className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-transparent bg-clip-text pb-1">experience?</span>
                            </h2>
                            <p className="text-[#64748B] text-[14px] sm:text-[16px] mt-2 mb-5 text-center font-medium">
                                We'd love to hear what you think.
                            </p>

                            {/* Interactive Star Rating */}
                            <div className="flex justify-center gap-1.5 sm:gap-3 mb-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className="transition-all hover:scale-110 active:scale-95 touch-manipulation"
                                    >
                                        <Star
                                            className={`w-[40px] h-[40px] sm:w-[48px] sm:h-[48px] transition-colors ${rating >= star ? "fill-[#FFB800] text-[#FFB800] filter drop-shadow-[0_2px_10px_rgba(255,184,0,0.4)]" : "fill-slate-200 text-slate-200"}`}
                                        />
                                    </button>
                                ))}
                            </div>

                            <p className="text-[#64748B] text-[13px] sm:text-[15px] mt-1 mb-6 text-center font-medium">
                                Your feedback helps<br /> us serve you better.
                            </p>

                            {/* CTA Button */}
                            <button
                                onClick={continueFromWelcome}
                                className="w-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white font-medium text-[16px] sm:text-[17px] rounded-xl py-[14px] sm:py-[18px] flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(99,102,241,0.4)] transition-transform hover:scale-[1.02] active:scale-[0.98] shrink-0"
                            >
                                <span className="text-yellow-200 text-lg leading-none">✨</span> Share My Experience <ArrowRight className="w-5 h-5 ml-1 opacity-90" />
                            </button>
                        </div>

                        {/* Trust Indicators */}
                        <div className="w-full flex flex-col items-center mt-5 mb-1 shrink-0">
                            <div className="inline-flex items-center justify-center gap-2 bg-indigo-50/80 border border-indigo-100/50 text-indigo-700 px-4 py-2 rounded-full shadow-sm">
                                <span className="text-[16px]">⚡</span>
                                <span className="text-[13px] sm:text-[14px] font-bold tracking-wide">
                                    Takes just 10 seconds!
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {step === "QUESTIONS" && initialQuestions.length > 0 && (
                    <div className="flex-1 flex flex-col w-full animate-in fade-in slide-in-from-right-8 duration-300">
                        {/* Small Header */}
                        <div className="flex items-center gap-3 mb-8 bg-white/50 p-3 rounded-2xl border border-white backdrop-blur-md shadow-sm">
                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center border border-slate-100 overflow-hidden shrink-0">
                                {businessLogo ? (
                                    <img src={businessLogo} alt={businessName} className="w-full h-full object-contain p-0.5" />
                                ) : (
                                    <Store className="w-6 h-6 text-slate-800" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 leading-tight">{businessName}</h3>
                                <p className="text-xs text-slate-500 font-medium">Internet Cafe</p>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mb-4 text-left">
                            <h2 className="text-xl font-extrabold text-slate-900">Help us improve</h2>
                            <span className="text-xs font-bold px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full">
                                {currentQuestionIndex + 1} of {initialQuestions.length}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 mb-8 font-medium">Your answers will help us generate a complete review for you.</p>

                        <div className="flex-1 space-y-6 mb-8 text-left">
                            {(() => {
                                const q = initialQuestions[currentQuestionIndex];
                                return (
                                    <div key={q.id} className="animate-in fade-in slide-in-from-right-4 duration-300 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                        <label className="block text-base font-bold text-slate-800 mb-4">{q.question} {q.required && <span className="text-red-500">*</span>}</label>

                                        {q.options && Array.isArray(q.options) && q.options.length > 0 ? (
                                            <div className="flex flex-wrap gap-2.5">
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
                                                                    nextArr = [cleanOpt];
                                                                }
                                                                setAnswers({ ...answers, [q.id]: nextArr.join(', ') });

                                                                if (!isSelected) {
                                                                    setTimeout(() => {
                                                                        if (currentQuestionIndex < initialQuestions.length - 1) {
                                                                            setCurrentQuestionIndex(prev => prev + 1);
                                                                        } else {
                                                                            handleFinishQuestions(rating);
                                                                        }
                                                                    }, 400);
                                                                }
                                                            }}
                                                            className={`px-5 py-2.5 rounded-xl text-[15px] font-semibold transition-all border ${isSelected
                                                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm ring-1 ring-indigo-500'
                                                                : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                                                                }`}
                                                        >
                                                            {opt}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        ) : (
                                            <Textarea
                                                className="resize-none rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 p-4"
                                                placeholder="Write your answer here..."
                                                rows={4}
                                                value={answers[q.id] || ''}
                                                onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                                            />
                                        )}
                                    </div>
                                );
                            })()}
                        </div>

                        <div className="space-y-4 pb-4">
                            {currentQuestionIndex < initialQuestions.length - 1 ? (
                                <button
                                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                                    className="w-full bg-slate-900 text-white font-medium text-lg rounded-2xl py-[16px] flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Next Question <ArrowRight className="ml-2 h-5 w-5" />
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleFinishQuestions(rating)}
                                    className="w-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white font-medium text-lg rounded-2xl py-[16px] flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(99,102,241,0.4)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Generate Review
                                </button>
                            )}

                            {currentQuestionIndex > 0 && (
                                <button
                                    onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                                    className="w-full text-slate-500 font-semibold py-3 transition-colors hover:text-slate-800"
                                >
                                    Go Back
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {step === "GENERATING" && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center w-full animate-in fade-in zoom-in-95 duration-500">
                        <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center mb-6 relative border border-slate-100">
                            <div className="absolute inset-0 border-4 border-indigo-100 rounded-full animate-ping opacity-20"></div>
                            <Loader2 className="h-10 w-10 animate-spin text-[#6366F1]" />
                        </div>
                        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Writing your review...</h2>
                        <p className="text-[15px] font-medium text-slate-500 max-w-[280px]">
                            We're using your answers to craft a natural, high-quality review.
                        </p>
                    </div>
                )}

                {step === "RESULT" && (
                    <div className="flex-1 flex flex-col w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-3 mb-6 bg-emerald-50 text-emerald-800 p-4 rounded-2xl border border-emerald-100 shadow-sm">
                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                                <Star className="fill-emerald-600 text-emerald-600 h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="font-bold text-lg leading-tight">Review Draft Ready!</h2>
                                <p className="text-sm font-medium opacity-90">Please review and edit if needed.</p>
                            </div>
                        </div>

                        <Textarea
                            value={generatedReview}
                            onChange={(e) => setGeneratedReview(e.target.value)}
                            className="flex-1 min-h-[220px] max-h-[300px] text-[16px] p-5 resize-none rounded-2xl bg-white border-slate-200 shadow-sm font-medium text-slate-700 focus-visible:ring-emerald-500 mb-6 leading-relaxed"
                        />

                        <div className="mt-auto space-y-4 pb-4">
                            <button
                                onClick={copyAndContinue}
                                className="w-full bg-[#10B981] text-white font-bold text-[17px] rounded-2xl py-[18px] flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(16,185,129,0.3)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <Copy className="h-5 w-5" /> Copy & Continue to Google
                            </button>

                            <button
                                onClick={() => {
                                    setStep("WELCOME");
                                    setRating(0);
                                    setAnswers({});
                                    setCurrentQuestionIndex(0);
                                }}
                                className="w-full text-slate-500 font-semibold py-3 transition-colors hover:text-slate-800"
                            >
                                Start Over
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {hasWatermark && (
                <footer className="w-full py-5 text-center text-xs font-medium text-slate-400 bg-transparent relative z-10">
                    Trusted by <span className="font-bold text-slate-600">Google Review Assistant</span>
                </footer>
            )}
        </div>
    );
}
