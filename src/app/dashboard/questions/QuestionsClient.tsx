"use client";

import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, GripVertical, Trash2, Edit2, MessageSquare, Loader2, Check } from "lucide-react";
import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { saveQuestionsLayout } from "./actions";
import { useRouter } from "next/navigation";

export function QuestionsClient({ initialQuestions }: { initialQuestions: any[] }) {
    const [questions, setQuestions] = useState(initialQuestions);
    const [isSaving, setIsSaving] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const [editingId, setEditingId] = useState<string | null>(null);

    const handleAddQuestion = () => {
        const newQ = { id: Date.now().toString(), question: "New Question", type: "Text", required: false };
        setQuestions([...questions, newQ]);
        setEditingId(newQ.id);
    };

    const handleDelete = (id: string) => {
        setQuestions(questions.filter(q => q.id !== id));
    };

    const updateQuestion = (id: string, field: string, value: any) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
    };

    const handleSave = () => {
        setIsSaving(true);
        startTransition(async () => {
            try {
                const res = await saveQuestionsLayout(questions);
                if (res.success) {
                    alert("Questions saved successfully!");
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
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Review Questions</h2>
                    <p className="text-muted-foreground">
                        Build and organize the questions asked to your customers when they scan the QR code.
                    </p>
                </div>
                <Button className="flex items-center gap-2" onClick={handleAddQuestion}>
                    <Plus className="h-4 w-4" /> Add Question
                </Button>
            </div>

            <div className="space-y-4">
                {questions.map((q, index) => (
                    <Card key={q.id}>
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 py-4">
                            <div className="flex items-center gap-4">
                                <div className="cursor-grab text-muted-foreground hover:text-foreground">
                                    <GripVertical className="h-5 w-5" />
                                </div>
                                <div>
                                    {editingId === q.id ? (
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-sm">Q{index + 1}.</span>
                                            <Input
                                                className="h-8 max-w-sm"
                                                value={q.question}
                                                onChange={(e) => updateQuestion(q.id, 'question', e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)}
                                            />
                                        </div>
                                    ) : (
                                        <CardTitle className="text-base font-semibold">
                                            Q{index + 1}. {q.question}
                                        </CardTitle>
                                    )}
                                    <CardDescription className="mt-1 flex items-center gap-2">
                                        Type: <span className="font-medium text-foreground">{q.type || q.questionType}</span>
                                        {" • "}
                                        <button
                                            onClick={() => updateQuestion(q.id, 'required', !q.required)}
                                            className={q.required ? "text-emerald-500 font-medium hover:underline" : "text-muted-foreground hover:underline"}
                                        >
                                            {q.required ? "Required" : "Optional"}
                                        </button>
                                    </CardDescription>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {editingId === q.id ? (
                                    <Button variant="ghost" size="icon" onClick={() => setEditingId(null)} className="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50">
                                        <Check className="h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button variant="ghost" size="icon" onClick={() => setEditingId(q.id)} aria-label="Edit question">
                                        <Edit2 className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                )}
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(q.id)} className="text-red-500 hover:bg-red-50 hover:text-red-600" aria-label="Delete question">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                    </Card>
                ))}

                {questions.length === 0 && (
                    <div className="flex h-[200px] flex-col items-center justify-center rounded-md border border-dashed text-muted-foreground text-sm">
                        <MessageSquare className="h-8 w-8 mb-4 text-muted-foreground/50" />
                        No questions added yet. Setup your first question!
                    </div>
                )}
            </div>

            <div className="flex justify-end pt-4">
                <Button size="lg" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Save Form Layout
                </Button>
            </div>
        </div>
    );
}
