import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Filter } from 'lucide-react';

interface FunnelStep {
    label: string;
    value: number;
    description: string;
}

interface ReviewFunnelProps {
    scans: number;
    sessions: number;
    feedbacks: number;
    generated: number;
    googleClicks: number;
}

export function ReviewFunnel({ scans, sessions, feedbacks, generated, googleClicks }: ReviewFunnelProps) {
    const steps: FunnelStep[] = [
        { label: 'QR Scans', value: scans, description: 'Total QR Scanned' },
        { label: 'Sessions', value: sessions, description: 'Review Flow Started' },
        { label: 'Feedback Submitted', value: feedbacks, description: 'Completed Survey' },
        { label: 'Review Generated', value: generated, description: 'Draft Output' },
        { label: 'Google Review Clicks', value: googleClicks, description: 'Navigated to Google' },
    ];

    const max = Math.max(scans, 1); // Avoid division by 0

    return (
        <Card className="h-full flex flex-col shadow-sm">
            <CardHeader className="pb-3 border-b border-border/50">
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-primary" />
                    <CardTitle>Customer Review Funnel</CardTitle>
                </div>
                <CardDescription>
                    Understand customer drop-off points through the review journey.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 flex-1 flex flex-col justify-center">
                <div className="space-y-6">
                    {steps.map((step, idx) => {
                        const percentage = scans > 0 ? Math.round((step.value / max) * 100) : 0;
                        const dropFromTotal = scans > 0 ? 100 - percentage : 0;

                        return (
                            <div key={step.label} className="group relative">
                                {/* Connector Line */}
                                {idx < steps.length - 1 && (
                                    <div className="absolute left-6 top-8 w-0.5 h-10 bg-border/40" />
                                )}

                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-8 flex items-center justify-center font-bold text-xs rounded-md ${percentage > 70 ? 'bg-emerald-100 text-emerald-800' :
                                            percentage > 40 ? 'bg-amber-100 text-amber-800' :
                                                'bg-red-100 text-red-800'
                                        }`}>
                                        {percentage}%
                                    </div>

                                    <div className="flex-1 space-y-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                                {step.label}
                                            </span>
                                            <span className="font-bold tabular-nums">
                                                {step.value.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="h-2.5 w-full bg-muted/60 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary/80 transition-all duration-1000 ease-out rounded-full"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
