import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Target, Activity, Users, Zap } from "lucide-react";

export default async function BusinessOverviewPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;

    const business = await prisma.business.findUnique({
        where: { id: params.id },
        include: {
            members: { select: { id: true } },
            subscriptions: {
                where: { status: 'active' },
                include: { plan: true },
                take: 1
            },
            campaigns: {
                where: { status: 'active' }
            },
            _count: {
                select: {
                    feedbackSubmissions: true,
                    generatedReviews: true,
                    locations: true,
                }
            }
        }
    });

    if (!business) notFound();

    const activeSubscription = business.subscriptions[0];
    const plan = activeSubscription?.plan;

    // Mock Default Plan Limits (To be replaced with actual plan values based on limits logic)
    const aiLimit = plan ? 500 : 50;
    const aiUsed = business._count.generatedReviews;
    const aiPercent = Math.min((aiUsed / aiLimit) * 100, 100);

    const locationsLimit = plan ? 5 : 1;
    const locationsUsed = business._count.locations;
    const locationsPercent = Math.min((locationsUsed / locationsLimit) * 100, 100);

    const activeCampaigns = business.campaigns.length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Business Overview</h2>
                <span className="text-sm text-slate-500 font-mono">ID: {business.id}</span>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-[13px] font-semibold text-slate-600">Reviews Submitted</CardTitle>
                        <dt className="p-1.5 bg-purple-50 rounded-md">
                            <Activity className="h-4 w-4 text-purple-600" />
                        </dt>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{business._count.feedbackSubmissions.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-[13px] font-semibold text-slate-600">AI Drafts Generated</CardTitle>
                        <dt className="p-1.5 bg-emerald-50 rounded-md">
                            <Zap className="h-4 w-4 text-emerald-600" />
                        </dt>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{business._count.generatedReviews.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-[13px] font-semibold text-slate-600">Total Locations</CardTitle>
                        <dt className="p-1.5 bg-blue-50 rounded-md">
                            <Target className="h-4 w-4 text-blue-600" />
                        </dt>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{business._count.locations.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-[13px] font-semibold text-slate-600">Member Count</CardTitle>
                        <dt className="p-1.5 bg-amber-50 rounded-md">
                            <Users className="h-4 w-4 text-amber-600" />
                        </dt>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{business.members.length.toLocaleString()}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Usage Progress Section */}
            <Card className="shadow-sm border-slate-200 overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                    <CardTitle className="text-base text-slate-800">Monthly Usage (vs Plan Default)</CardTitle>
                    <CardDescription>
                        Usage compared to default <span className="font-semibold text-slate-700">{plan?.name || 'Free'}</span> plan limits.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-8">
                        {/* AI Reviews Bar */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-medium text-slate-700">AI Reviews Generated</span>
                                <span className="text-slate-500 font-mono"><span className="text-slate-900 font-semibold">{aiUsed}</span> / {aiLimit}</span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                <div className="h-full bg-emerald-500 transition-all duration-500 rounded-full" style={{ width: `${aiPercent}%` }} />
                            </div>
                            {aiPercent > 90 && (
                                <p className="text-xs text-rose-500 mt-1 font-medium text-right">Approaching limit</p>
                            )}
                        </div>

                        {/* Locations Bar */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-medium text-slate-700">Locations Consumed</span>
                                <span className="text-slate-500 font-mono"><span className="text-slate-900 font-semibold">{locationsUsed}</span> / {locationsLimit}</span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                <div className="h-full bg-blue-500 transition-all duration-500 rounded-full" style={{ width: `${locationsPercent}%` }} />
                            </div>
                        </div>

                        {/* Quick Additional Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 mt-4 border-t border-slate-100">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Active Campaigns</p>
                                <p className="text-2xl font-bold text-slate-800">{activeCampaigns}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Account Health</p>
                                <p className="text-sm font-semibold text-emerald-600 mt-2 bg-emerald-50 px-2 py-1 inline-block rounded border border-emerald-100">Excellent</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
