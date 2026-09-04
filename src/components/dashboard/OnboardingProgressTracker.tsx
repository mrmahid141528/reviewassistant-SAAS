import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, ArrowRight, Sparkles, Building2, User } from 'lucide-react';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';

interface OnboardingProgressTrackerProps {
    business: any;
    dbUser: any;
    locations?: any[];
}

export function OnboardingProgressTracker({ business, dbUser, locations = [] }: OnboardingProgressTrackerProps) {
    const businessSettings = business?.settings && typeof business.settings === 'object' ? business.settings : {};

    // Checklist Definition
    const checks = [
        {
            id: 'biz_logo',
            label: 'Upload Business Logo',
            category: 'business',
            icon: Building2,
            isComplete: !!business?.logoUrl,
            link: '/dashboard/settings/business'
        },
        {
            id: 'biz_category',
            label: 'Set Business Category',
            category: 'business',
            icon: Building2,
            isComplete: !!business?.category,
            link: '/dashboard/settings/business'
        },
        {
            id: 'review_link',
            label: 'Add Google Review URL',
            category: 'business',
            icon: Building2,
            isComplete: locations.some(l => !!l.reviewLink),
            link: '/dashboard/locations'
        },
        {
            id: 'biz_phone',
            label: 'Add Business Contact Phone',
            category: 'business',
            icon: Building2,
            isComplete: !!business?.phone,
            link: '/dashboard/settings/business'
        },
        {
            id: 'ai_context',
            label: 'Train AI with "About Business"',
            category: 'ai',
            icon: Sparkles,
            isComplete: !!businessSettings?.aboutBusiness && businessSettings.aboutBusiness.length > 10,
            link: '/dashboard/settings/ai-assistant'
        },
        {
            id: 'user_avatar',
            label: 'Upload Profile Photo',
            category: 'user',
            icon: User,
            isComplete: !!dbUser?.image,
            link: '/dashboard/profile'
        },
        {
            id: 'user_name',
            label: 'Add Full Name',
            category: 'user',
            icon: User,
            isComplete: !!dbUser?.name && dbUser.name.toLowerCase() !== dbUser.email?.split('@')[0].toLowerCase(),
            link: '/dashboard/profile'
        }
    ];

    const totalTasks = checks.length;
    const completedTasks = checks.filter(c => c.isComplete).length;
    const progressPercentage = Math.round((completedTasks / totalTasks) * 100);
    const isSetupComplete = completedTasks === totalTasks;

    const outstandingTasks = checks.filter(c => !c.isComplete);

    if (isSetupComplete) {
        return (
            <div className="w-full rounded-xl border border-emerald-200/50 bg-emerald-50/50 p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm animate-in fade-in transition-all">
                <div>
                    <h3 className="text-emerald-800 font-semibold text-lg flex items-center gap-2">
                        🎉 Profile & AI Setup 100% Complete!
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-medium text-emerald-900">{business.name || 'Your Business'}</span>
                        <span className="text-emerald-300">•</span>
                        <span className="text-sm text-emerald-700">AI is fully trained</span>
                    </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="outline" size="sm" className="bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 flex-1 md:flex-none">
                        <CheckCircle2 className="w-4 h-4 mr-2" /> All Good
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full rounded-xl border bg-card p-5 md:p-6 shadow-sm animate-in fade-in space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        🚀 Complete Your Setup
                    </h3>
                    <p className="text-sm text-muted-foreground w-full max-w-2xl">
                        Optimize your business profile and train the AI Assistant for better review generation. You are {progressPercentage}% done!
                    </p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto shrink-0 min-w-[200px]">
                    <Progress value={progressPercentage} className="h-2.5 w-full" />
                    <span className="text-sm font-semibold">{progressPercentage}%</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-3 border-t">
                {outstandingTasks.slice(0, 3).map((task) => (
                    <Link key={task.id} href={task.link}>
                        <div className="group flex items-start p-3 border rounded-lg hover:border-primary hover:bg-primary/5 transition-all cursor-pointer h-full">
                            <div className="mt-0.5 shrink-0 mr-3 text-muted-foreground group-hover:text-primary">
                                <Circle className="w-4 h-4" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <h4 className="text-sm font-medium leading-none group-hover:text-primary transition-colors">
                                    {task.label}
                                </h4>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 group-hover:text-primary/70">
                                    Take action <ArrowRight className="w-3 h-3 inline-block relative top-[0.5px]" />
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
            {outstandingTasks.length > 3 && (
                <div className="w-full text-center pt-2">
                    <p className="text-xs text-muted-foreground">+{outstandingTasks.length - 3} more tasks to complete...</p>
                </div>
            )}
        </div>
    );
}
