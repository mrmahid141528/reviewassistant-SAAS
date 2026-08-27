"use client"

import { MapPin, Zap, UserCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function UsageClient({ subscription, usage }: any) {
    let maxLocations = -1;
    let maxReviews = -1;
    let maxTeams = -1;

    if (subscription?.plan?.limits) {
        const limits = subscription.plan.limits as any;
        maxLocations = limits.maxLocations ?? -1;
        maxReviews = limits.maxGenerations ?? -1;
        maxTeams = limits.teamMembers ?? -1;
    } else if (!subscription) {
        maxLocations = 1; maxReviews = 50; maxTeams = 1;
    }

    const locPercent = maxLocations === -1 ? 0 : Math.min(100, Math.round((usage.locations / maxLocations) * 100));
    const revPercent = maxReviews === -1 ? 0 : Math.min(100, Math.round((usage.reviews / maxReviews) * 100));
    const teamPercent = maxTeams === -1 ? 0 : Math.min(100, Math.round((usage.teams / maxTeams) * 100));

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <h3 className="text-sm font-bold tracking-widest text-muted-foreground uppercase ml-1">USAGE & LIMITS</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3 text-foreground font-semibold">
                            <MapPin className="h-5 w-5 text-primary" /> Locations
                        </div>
                        <span className="text-sm font-black bg-muted px-3 py-1 rounded-md">{usage.locations} / {maxLocations === -1 ? '∞' : maxLocations}</span>
                    </div>
                    <Progress value={locPercent} className="h-3 rounded-full mb-3" />
                    <p className="text-sm text-muted-foreground font-medium text-right">
                        {maxLocations !== -1 ? `${Math.max(0, maxLocations - usage.locations)} locations remaining` : 'Unlimited'}
                    </p>
                </div>

                <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3 text-foreground font-semibold">
                            <Zap className="h-5 w-5 text-primary" /> AI Reviews
                        </div>
                        <span className="text-sm font-black bg-muted px-3 py-1 rounded-md">{usage.reviews.toLocaleString()} / {maxReviews === -1 ? '∞' : maxReviews.toLocaleString()}</span>
                    </div>
                    <Progress value={revPercent} className={`h-3 rounded-full mb-3 ${revPercent > 90 ? 'bg-amber-500' : ''}`} />
                    <p className="text-sm text-muted-foreground font-medium text-right">
                        {maxReviews !== -1 ? `${Math.max(0, maxReviews - usage.reviews).toLocaleString()} reviews remaining` : 'Unlimited'}
                    </p>
                </div>

                <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3 text-foreground font-semibold">
                            <UserCircle className="h-5 w-5 text-primary" /> Team Members
                        </div>
                        <span className="text-sm font-black bg-muted px-3 py-1 rounded-md">{usage.teams} / {maxTeams === -1 ? '∞' : maxTeams}</span>
                    </div>
                    <Progress value={teamPercent} className="h-3 rounded-full mb-3" />
                    <p className="text-sm text-muted-foreground font-medium text-right">
                        {maxTeams !== -1 ? `${Math.max(0, maxTeams - usage.teams)} invites remaining` : 'Unlimited'}
                    </p>
                </div>
            </div>
        </div>
    )
}
