"use client";

import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, GripVertical, Trash2, Edit2, MessageSquare, Loader2 } from "lucide-react";
import { useState } from "react";
import { saveQuestionsLayout } from "./actions";

export function QuestionsClient({ initialQuestions }: { initialQuestions: any[] }) {
    const [questions, setQuestions] = useState(initialQuestions);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await saveQuestionsLayout(questions);
            if (res.success) {
                alert("Questions saved successfully!");
            } else {
                alert("Error saving: " + res.error);
            }
        } catch (e: unknown) {
            alert("Error: " + (e instanceof Error ? e.message : 'Unknown error'));
        } finally {
            setIsSaving(false);
        }
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
                <Button className="flex items-center gap-2">
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
                                    <CardTitle className="text-base font-semibold">
                                        Q{index + 1}. {q.question}
                                    </CardTitle>
                                    <CardDescription className="mt-1">
                                        Type: <span className="font-medium text-foreground">{q.type || q.questionType}</span>
                                        {" • "}
                                        {q.required ? (
                                            <span className="text-emerald-500 font-medium">Required</span>
                                        ) : (
                                            <span className="text-muted-foreground">Optional</span>
                                        )}
                                    </CardDescription>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" aria-label="Edit question">
                                    <Edit2 className="h-4 w-4 text-muted-foreground" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 hover:text-red-600" aria-label="Delete question">
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
