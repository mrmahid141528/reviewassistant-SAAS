import React from 'react';
import { QrCode, MousePointerClick, MessageSquarePlus, Star, ArrowUpRight, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface KPIGridProps {
    metrics: {
        scans: number;
        sessions: number;
        generated: number;
        rating: number;
        totalReviews: number;
    }
}

export function KPIGrid({ metrics }: KPIGridProps) {
    const conversionRate = metrics.scans > 0 ? Math.round((metrics.sessions / metrics.scans) * 100) : 0;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* QR Scans */}
            <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">QR Scans</p>
                            <h2 className="text-3xl font-bold tracking-tight">{metrics.scans}</h2>
                        </div>
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <QrCode className="w-5 h-5 text-primary" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-xs text-emerald-500 font-medium bg-emerald-500/10 w-fit px-2 py-0.5 rounded-full">
                        <ArrowUpRight className="w-3 h-3 mr-0.5" /> 18.4% vs last period
                    </div>
                </CardContent>
            </Card>

            {/* Sessions */}
            <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Review Sessions</p>
                            <h2 className="text-3xl font-bold tracking-tight">{metrics.sessions}</h2>
                        </div>
                        <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                            <MousePointerClick className="w-5 h-5 text-blue-500" />
                        </div>
                    </div>
                    <p className="mt-4 text-xs text-muted-foreground font-medium">
                        <span className="font-semibold text-foreground">{conversionRate}%</span> of QR scans started flow
                    </p>
                </CardContent>
            </Card>

            {/* AI Reviews Generated */}
            <Card className="hover:shadow-md transition-shadow border-primary/20 bg-primary/5">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-primary/80">Reviews Generated</p>
                            <h2 className="text-3xl font-bold tracking-tight text-primary">{metrics.generated}</h2>
                        </div>
                        <div className="p-2 bg-primary/20 rounded-lg border border-primary/30">
                            <MessageSquarePlus className="w-5 h-5 text-primary" />
                        </div>
                    </div>
                    <p className="mt-4 text-xs text-primary/70 font-medium">
                        AI-assisted review drafts created
                    </p>
                </CardContent>
            </Card>

            {/* Google Rating */}
            <Card className="hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-yellow-500/20 to-transparent blur-2xl -mr-10 -mt-10 pointer-events-none" />
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Google Rating</p>
                            <div className="flex items-baseline gap-1.5">
                                <h2 className="text-3xl font-bold tracking-tight">{metrics.rating.toFixed(1)}</h2>
                                <Star className="w-5 h-5 fill-yellow-500 text-yellow-500 mb-0.5" />
                            </div>
                        </div>
                        <a href="#" className="p-1.5 hover:bg-muted rounded-md text-muted-foreground transition-colors group">
                            <ExternalLink className="w-4 h-4 group-hover:text-foreground" />
                        </a>
                    </div>
                    <p className="mt-4 text-xs text-muted-foreground font-medium">
                        <span className="font-semibold text-foreground">{metrics.totalReviews}</span> total verified ratings
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
