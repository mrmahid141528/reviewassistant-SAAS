import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Target, Star, BarChart3, TrendingUp, Calendar, Hash } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default async function BusinessAnalyticsTab(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;

    const business = await prisma.business.findUnique({
        where: { id },
    });

    if (!business) notFound();

    // Fetch real metrics
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const submissions = await prisma.feedbackSubmission.findMany({
        where: { businessId: id },
        orderBy: { createdAt: 'desc' }
    });

    const campaigns = await prisma.campaign.findMany({
        where: { businessId: id },
        include: { _count: { select: { feedbackSubmissions: true } } }
    });

    const totalSubmissions = submissions.length;
    const recentSubmissions = submissions.filter(s => s.createdAt >= thirtyDaysAgo);
    const avgRating = totalSubmissions > 0
        ? (submissions.reduce((acc, curr) => acc + curr.rating, 0) / totalSubmissions).toFixed(1)
        : "0.0";

    // Breakdown by platform
    const platformBreakdown = campaigns.reduce((acc: any, campaign) => {
        const platform = campaign.reviewPlatform || "Unknown";
        if (!acc[platform]) acc[platform] = 0;
        acc[platform] += campaign._count.feedbackSubmissions;
        return acc;
    }, {});

    const maxPlatformC = Math.max(...Object.values(platformBreakdown) as number[], 1);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            <div>
                <h2 className="text-xl font-bold text-slate-900">Analytics & Usage</h2>
                <p className="text-sm text-muted-foreground mt-1">Real-time performance metrics and campaign conversions.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="shadow-sm border-slate-200">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                                <Target className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Live Campaigns</p>
                                <p className="text-2xl font-bold text-slate-900">{campaigns.filter(c => c.status === 'active').length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                                <Star className="h-5 w-5 fill-current" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Avg. Rating</p>
                                <p className="text-2xl font-bold text-slate-900">{avgRating} <span className="text-base text-slate-400 font-normal">/ 5</span></p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100">
                                <Hash className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Total Feedback</p>
                                <p className="text-2xl font-bold text-slate-900">{totalSubmissions}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Last 30 Days</p>
                                <p className="text-2xl font-bold text-slate-900">+{recentSubmissions.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="bg-slate-50/50 border-b">
                        <CardTitle className="text-md flex items-center gap-2 text-slate-700">
                            <BarChart3 className="h-4 w-4" /> Feedback by Platform
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        {Object.keys(platformBreakdown).length > 0 ? (
                            Object.entries(platformBreakdown).map(([platform, count]) => {
                                const percentage = count as number > 0 ? ((count as number) / maxPlatformC) * 100 : 0;
                                return (
                                    <div key={platform} className="space-y-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="font-medium capitalize text-slate-700">{platform}</span>
                                            <span className="font-semibold text-slate-900">{count as number}</span>
                                        </div>
                                        <Progress value={percentage} className="h-2 [&>div]:bg-emerald-500" />
                                    </div>
                                )
                            })
                        ) : (
                            <div className="text-center py-6 text-slate-500 text-sm">No platform data available yet.</div>
                        )}
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="bg-slate-50/50 border-b">
                        <CardTitle className="text-md flex items-center gap-2 text-slate-700">
                            <Calendar className="h-4 w-4" /> Activity History (Last 5)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-100">
                            {submissions.slice(0, 5).map(sub => (
                                <div key={sub.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50">
                                    <div>
                                        <p className="text-sm font-medium text-slate-800">
                                            {sub.rating} Star Rating
                                        </p>
                                        <p className="text-xs text-slate-500">via Campaign</p>
                                    </div>
                                    <span className="text-xs text-slate-400 font-mono">
                                        {sub.createdAt.toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                            {submissions.length === 0 && (
                                <div className="p-6 text-center text-slate-500 text-sm">
                                    No activity history logged.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
