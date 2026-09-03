"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical, Trash2, Edit2, MessageSquare, Loader2, Sparkles, Smartphone, Plus, CheckCircle2, Grip, MoreVertical } from "lucide-react";
import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { saveQuestionsLayout } from "./actions";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { MapPin } from "lucide-react";

const QUESTION_TYPES = [
    { type: 'Rating', icon: '⭐', label: 'Rating (1-5)' },
    { type: 'Short Answer', icon: '✏️', label: 'Short Answer' },
    { type: 'Long Answer', icon: '📝', label: 'Long Answer' },
    { type: 'Multiple Choice', icon: '🔘', label: 'Multiple Choice' },
    { type: 'Yes / No', icon: '👍', label: 'Yes / No' },
];

const DEFAULT_RECOMMENDED = [
    { id: "req-1", question: "How would you rate your overall experience?", type: "Rating", required: true, options: [] },
    { id: "req-2", question: "What did you like most about your experience?", type: "Short Answer", required: true, options: [] },
    { id: "req-3", question: "Which product or service did you use?", type: "Multiple Choice", required: false, options: ["Service 1", "Service 2", "Other"] },
    { id: "req-4", question: "Would you like to share anything else?", type: "Long Answer", required: false, options: [] },
];

interface QuestionsClientProps {
    initialQuestions: any[];
    businessName: string;
    locations: { id: string, name: string }[];
    currentLocationId: string;
}

export function QuestionsClient({ initialQuestions, businessName, locations, currentLocationId }: QuestionsClientProps) {
    const [questions, setQuestions] = useState(initialQuestions);
    const [isSaving, setIsSaving] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newQuestionType, setNewQuestionType] = useState('Short Answer');
    const [newQuestionText, setNewQuestionText] = useState('');
    const [newQuestionRequired, setNewQuestionRequired] = useState(true);
    const [newQuestionOptions, setNewQuestionOptions] = useState<string[]>(['Option 1', 'Option 2']);

    const handleAddQuestion = () => {
        if (!newQuestionText) return;
        const newQ = {
            id: Date.now().toString(),
            question: newQuestionText,
            type: newQuestionType,
            required: newQuestionRequired,
            options: newQuestionType === 'Multiple Choice' ? newQuestionOptions.filter(o => o.trim() !== '') : []
        };
        setQuestions([...questions, newQ]);
        setIsAddModalOpen(false);
        setNewQuestionText('');
        setNewQuestionOptions(['Option 1', 'Option 2']);
    };

    const handleLoadRecommended = () => {
        setQuestions(DEFAULT_RECOMMENDED.map(q => ({ ...q, id: Date.now().toString() + Math.random() })));
    };

    const handleDelete = (id: string) => {
        setQuestions(questions.filter(q => q.id !== id));
    };

    const moveQuestion = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index > 0) {
            const arr = [...questions];
            [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
            setQuestions(arr);
        } else if (direction === 'down' && index < questions.length - 1) {
            const arr = [...questions];
            [arr[index + 1], arr[index]] = [arr[index], arr[index + 1]];
            setQuestions(arr);
        }
    };

    const handleSave = () => {
        setIsSaving(true);
        startTransition(async () => {
            try {
                const res = await saveQuestionsLayout(questions);
                if (res.success) {
                    router.refresh();
                } else {
                    alert("Error saving: " + res.error);
                }
            } catch (e: unknown) {
                alert("Error: " + (e instanceof Error ? e.message : 'Unknown error'));
            } finally {
                setIsSaving(false);
            }
        });
    }

    return (
        <div className="space-y-6 max-w-7xl animate-in fade-in duration-500 pb-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b pb-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Review Questions</h2>
                    <p className="text-muted-foreground mt-1 text-lg">
                        Create simple questions that help customers share their genuine experience.
                    </p>
                    {locations.length > 0 && (
                        <div className="mt-4 flex items-center bg-muted/30 w-fit p-1 rounded-md border">
                            <MapPin className="w-4 h-4 ml-2 text-muted-foreground" />
                            <select
                                className="appearance-none bg-transparent border-0 text-sm font-medium pl-2 pr-8 py-1 outline-none cursor-pointer"
                                value={currentLocationId}
                                onChange={(e) => {
                                    const params = new URLSearchParams(searchParams.toString());
                                    if (e.target.value === 'all') params.delete('locationId');
                                    else params.set('locationId', e.target.value);
                                    router.push(`${pathname}?${params.toString()}`);
                                }}
                            >
                                <option value="all">Business: {businessName}</option>
                                {locations.map(loc => (
                                    <option key={loc.id} value={loc.id}>{businessName} — {loc.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="lg" className="hidden lg:flex" onClick={() => window.scrollTo(0, document.body.scrollHeight)}>
                        <Smartphone className="mr-2 w-4 h-4" /> Live Preview
                    </Button>
                    <Button size="lg" onClick={() => setIsAddModalOpen(true)}>
                        <Plus className="mr-2 w-4 h-4" /> Add Question
                    </Button>
                    <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                        <DialogContent className="w-[95vw] max-h-[90vh] overflow-y-auto sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Add New Question</DialogTitle>
                                <DialogDescription>Ask your customers to share specific details about their visit.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Question Text</label>
                                    <Input
                                        placeholder="e.g. What did you like most about our service?"
                                        value={newQuestionText}
                                        onChange={e => setNewQuestionText(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Answer Type</label>
                                    <select
                                        className="w-full appearance-none bg-card border rounded-md text-sm pl-3 pr-8 py-2 outline-none focus:ring-1 focus:ring-primary"
                                        value={newQuestionType}
                                        onChange={e => setNewQuestionType(e.target.value)}
                                    >
                                        {QUESTION_TYPES.map(qt => (
                                            <option key={qt.type} value={qt.type}>{qt.icon} {qt.label}</option>
                                        ))}
                                    </select>
                                </div>
                                {newQuestionType === 'Multiple Choice' && (
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium">Choice Options</label>
                                        {newQuestionOptions.map((opt, i) => (
                                            <div key={i} className="flex gap-2">
                                                <Input
                                                    placeholder={`Option ${i + 1}`}
                                                    value={opt}
                                                    onChange={e => {
                                                        const newOpts = [...newQuestionOptions];
                                                        newOpts[i] = e.target.value;
                                                        setNewQuestionOptions(newOpts);
                                                    }}
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        if (newQuestionOptions.length > 1) {
                                                            setNewQuestionOptions(newQuestionOptions.filter((_, idx) => idx !== i));
                                                        }
                                                    }}
                                                    className="self-center shrink-0"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </Button>
                                            </div>
                                        ))}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setNewQuestionOptions([...newQuestionOptions, `Option ${newQuestionOptions.length + 1}`])}
                                            className="w-full mt-2 border-dashed"
                                        >
                                            <Plus className="w-4 h-4 mr-2" /> Add Option
                                        </Button>
                                    </div>
                                )}
                                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                                    <div className="space-y-0.5">
                                        <div className="text-sm font-medium">Require Answer</div>
                                        <div className="text-xs text-muted-foreground">Customers must answer this to proceed.</div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 accent-primary"
                                        checked={newQuestionRequired}
                                        onChange={(e) => setNewQuestionRequired(e.target.checked)}
                                    />
                                </div>
                                <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                                    <div className="space-y-0.5">
                                        <div className="text-sm font-medium text-indigo-900 flex items-center">
                                            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-indigo-500" /> AI Generation Context
                                        </div>
                                        <div className="text-xs text-indigo-700">Include answer in the AI prompt to draft their Google Review.</div>
                                    </div>
                                    <input type="checkbox" className="w-4 h-4 accent-indigo-600" defaultChecked />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                                <Button onClick={handleAddQuestion}>Add Question</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Pane - Builder */}
                <div className="col-span-1 lg:col-span-2 space-y-6">

                    {/* Status Info Card */}
                    <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/10">
                        <div>
                            <h3 className="font-semibold text-primary mb-1">Your review flow</h3>
                            <p className="text-sm text-foreground font-medium flex items-center">
                                <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs font-bold mr-2">
                                    {questions.length} active questions
                                </span>
                                Questions → AI Review → Customer Edit → Google Review
                            </p>
                        </div>
                        <div className="hidden sm:flex items-center text-sm font-medium text-emerald-600">
                            <CheckCircle2 className="w-4 h-4 mr-1.5" /> Ready
                        </div>
                    </div>

                    <div className="flex justify-between items-end">
                        <h3 className="text-xl font-semibold tracking-tight">Customer Questions</h3>
                        {questions.length > 0 && (
                            <Button size="sm" onClick={handleSave} disabled={isSaving}>
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Save Order & Setup
                            </Button>
                        )}
                    </div>

                    {questions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-xl bg-card">
                            <MessageSquare className="w-12 h-12 text-muted-foreground/30 mb-4" />
                            <h3 className="text-lg font-semibold">No questions yet</h3>
                            <p className="text-muted-foreground text-sm max-w-sm text-center mt-1 mb-6">
                                Add a few simple questions to help customers share their genuine experience.
                            </p>
                            <div className="flex items-center gap-3">
                                <Button onClick={handleLoadRecommended} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                    <Sparkles className="w-4 h-4 mr-2" /> Use Recommended Setup
                                </Button>
                                <Button variant="outline" onClick={() => setIsAddModalOpen(true)}>Create Custom</Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {questions.map((q, index) => {
                                const typeIcon = QUESTION_TYPES.find(t => t.type === (q.type || q.questionType))?.icon || '✏️';

                                return (
                                    <Card key={q.id} className="relative group transition-all duration-200 border-l-4 border-l-transparent hover:border-l-primary/50 overflow-hidden">
                                        <div className="absolute left-2 top-0 bottom-0 flex flex-col items-center justify-center w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="flex flex-col gap-1">
                                                <button onClick={() => moveQuestion(index, 'up')} disabled={index === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30">▲</button>
                                                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                                                <button onClick={() => moveQuestion(index, 'down')} disabled={index === questions.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30">▼</button>
                                            </div>
                                        </div>

                                        <CardContent className="p-0 pl-10 pr-4 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-start gap-3">
                                                    <div className="font-mono text-sm text-muted-foreground mt-0.5 w-6 shrink-0">
                                                        {(index + 1).toString().padStart(2, '0')}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-base mb-1">{q.question}</h4>
                                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                                            <div className="flex items-center">
                                                                <span className="mr-1.5">{typeIcon}</span> {q.type || q.questionType}
                                                            </div>
                                                            <div className="flex items-center">
                                                                <span className={q.required ? "text-rose-500 font-medium" : "opacity-70"}>
                                                                    {q.required ? 'Required' : 'Optional'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 shrink-0 self-end sm:self-center border-t sm:border-t-0 pt-3 sm:pt-0 w-full sm:w-auto justify-between sm:justify-end">
                                                <div className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span> Active
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => handleDelete(q.id)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right Pane - Sticky Live Preview Desktop */}
                <div className="col-span-1 hidden lg:block">
                    <div className="sticky top-8 rounded-3xl border-[8px] border-zinc-900 bg-zinc-950 overflow-hidden shadow-2xl w-[320px] mx-auto h-[650px] flex flex-col">

                        {/* Fake Phone Status Bar */}
                        <div className="bg-zinc-950 text-white h-6 flex justify-between items-center px-4 pt-1 text-[10px] font-medium opacity-50 shrink-0">
                            <span>9:41</span>
                            <div className="flex gap-1.5 items-center">
                                <span className="block w-3 h-2.5 rounded-[1px] bg-white"></span>
                                <span className="block w-3 h-2.5 rounded-[1px] bg-white"></span>
                            </div>
                        </div>

                        {/* Phone Content Header */}
                        <div className="bg-zinc-900 px-5 pt-6 pb-6 text-center border-b border-zinc-800 shrink-0">
                            <h4 className="text-white font-bold text-lg">Leave a Review</h4>
                            <p className="text-zinc-400 text-xs mt-1">Share your experience to help us improve.</p>
                        </div>

                        {/* Scrollable Questions Area inside Preview */}
                        <div className="flex-1 overflow-y-auto bg-[#fafafa] p-5 space-y-6 flex flex-col">
                            {questions.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center opacity-50 text-center px-4">
                                    <div className="w-12 h-12 rounded-full bg-zinc-200 mb-3"></div>
                                    <div className="text-sm font-medium text-zinc-500 mb-1">Live Preview</div>
                                    <div className="text-xs text-zinc-400">Add questions to see them here</div>
                                </div>
                            ) : (
                                questions.map((q, i) => (
                                    <div key={q.id} className="bg-white rounded-xl shadow-sm border p-4 space-y-3">
                                        <div className="text-[13px] font-semibold text-zinc-800 leading-snug">
                                            {q.question} {q.required && <span className="text-red-500">*</span>}
                                        </div>

                                        {/* Mock Render based on Type */}
                                        {(q.type === 'Rating' || q.questionType === 'Rating') && (
                                            <div className="flex justify-between px-1">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <span key={star} className="text-2xl text-zinc-300">★</span>
                                                ))}
                                            </div>
                                        )}

                                        {(q.type === 'Short Answer' || q.questionType === 'Short Answer' || q.type === 'Text' || !q.type) && (
                                            <div className="h-9 rounded-md bg-zinc-50 border border-zinc-200 px-3 flex items-center">
                                                <span className="text-xs text-zinc-400">Type here...</span>
                                            </div>
                                        )}

                                        {(q.type === 'Long Answer' || q.questionType === 'Long Answer') && (
                                            <div className="h-20 rounded-md bg-zinc-50 border border-zinc-200 p-3 pt-2">
                                                <span className="text-xs text-zinc-400">Tell us details...</span>
                                            </div>
                                        )}

                                        {(q.type === 'Yes / No' || q.questionType === 'Yes / No') && (
                                            <div className="flex gap-2">
                                                <div className="flex-1 py-1.5 border rounded-md flex items-center justify-center gap-1.5 bg-zinc-50">
                                                    <div className="w-3 h-3 rounded-full border border-zinc-300"></div><span className="text-xs font-medium">Yes</span>
                                                </div>
                                                <div className="flex-1 py-1.5 border rounded-md flex items-center justify-center gap-1.5 bg-zinc-50">
                                                    <div className="w-3 h-3 rounded-full border border-zinc-300"></div><span className="text-xs font-medium">No</span>
                                                </div>
                                            </div>
                                        )}

                                        {(q.type === 'Multiple Choice' || q.questionType === 'Multiple Choice') && (
                                            <div className="space-y-1.5">
                                                <div className="py-2 border rounded-md flex items-center px-3 bg-zinc-50">
                                                    <div className="w-3 h-3 rounded-full border border-zinc-300 mr-2 shrink-0"></div><span className="text-xs truncate">Option 1</span>
                                                </div>
                                                <div className="py-2 border rounded-md flex items-center px-3 bg-zinc-50">
                                                    <div className="w-3 h-3 rounded-full border border-zinc-300 mr-2 shrink-0"></div><span className="text-xs truncate">Option 2</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}

                            {questions.length > 0 && (
                                <div className="pt-2 pb-6">
                                    <button className="w-full bg-blue-600 text-white rounded-lg py-3 text-[13px] font-bold shadow-sm shadow-blue-500/20">
                                        Continue to Review
                                    </button>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
