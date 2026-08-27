import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Star, Link as LinkIcon, QrCode, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RecentActivityProps {
    activities: { type: 'scan' | 'session' | 'generated' | 'clicked', timeLabel: string }[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
    return (
        <Card className="h-full shadow-sm flex flex-col">
            <CardHeader className="pb-3">
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Customer interactions across your funnel.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                {activities.length > 0 ? (
                    <div className="space-y-4">
                        {activities.map((a, i) => (
                            <div key={i} className="flex gap-4 items-start">
                                <div className="mt-1">
                                    {a.type === 'scan' && <div className="bg-blue-100 p-1.5 rounded-full"><QrCode className="w-4 h-4 text-blue-600" /></div>}
                                    {a.type === 'session' && <div className="bg-amber-100 p-1.5 rounded-full"><PenLine className="w-4 h-4 text-amber-600" /></div>}
                                    {a.type === 'generated' && <div className="bg-emerald-100 p-1.5 rounded-full"><Star className="w-4 h-4 text-emerald-600" /></div>}
                                    {a.type === 'clicked' && <div className="bg-indigo-100 p-1.5 rounded-full"><LinkIcon className="w-4 h-4 text-indigo-600" /></div>}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between w-full items-center">
                                        <p className="text-sm font-medium text-foreground">
                                            {a.type === 'scan' && 'QR code scanned'}
                                            {a.type === 'session' && 'Session started'}
                                            {a.type === 'generated' && 'Review generated'}
                                            {a.type === 'clicked' && 'Google link clicked'}
                                        </p>
                                        <span className="text-xs text-muted-foreground">{a.timeLabel}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {a.type === 'scan' && 'Main Store QR'}
                                        {a.type === 'session' && 'Customer opened survey'}
                                        {a.type === 'generated' && 'Customer completed flow'}
                                        {a.type === 'clicked' && 'Redirected to Google'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-[200px] flex items-center justify-center border border-dashed rounded-md text-sm text-muted-foreground">
                        No recent activity.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

interface CustomerFeedbackProps {
    feedbacks: { rating: number, text: string, timeLabel: string }[];
}

export function CustomerFeedback({ feedbacks }: CustomerFeedbackProps) {
    return (
        <Card className="h-full shadow-sm flex flex-col">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Customer Feedback</CardTitle>
                    <CardDescription>Recent feedback from your customers</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
                {feedbacks.length > 0 ? (
                    <div className="space-y-4 flex-1">
                        {feedbacks.map((f, i) => (
                            <div key={i} className="flex flex-col gap-2 border-b pb-4 last:border-0 last:pb-0">
                                <div className="flex justify-between items-center w-full">
                                    <div className="flex gap-0.5">
                                        {Array.from({ length: 5 }).map((_, starIndex) => (
                                            <Star key={starIndex} className={`w-3.5 h-3.5 ${starIndex < f.rating ? 'fill-yellow-500 text-yellow-500' : 'fill-muted text-muted'}`} />
                                        ))}
                                    </div>
                                    <span className="text-xs text-muted-foreground">{f.timeLabel}</span>
                                </div>
                                <p className="text-sm font-medium text-foreground line-clamp-2 italic">
                                    "{f.text}"
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-[200px] flex items-center justify-center border border-dashed rounded-md text-sm text-muted-foreground flex-1">
                        No feedback collected yet.
                    </div>
                )}

                <div className="mt-4 pt-4 border-t w-full flex justify-end">
                    <span className="text-sm font-medium text-primary cursor-pointer hover:underline">
                        View all feedback &rarr;
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
