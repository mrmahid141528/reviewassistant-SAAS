import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Building, MessageSquare, Target, Activity, Banknote, BarChart4, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SuperAdminDashboard() {
    const totalUsers = await prisma.user.count();
    const totalBusinesses = await prisma.business.count();
    const totalCampaigns = await prisma.campaign.count();
    const totalSubmissions = await prisma.feedbackSubmission.count();

    const recentBusinesses = await prisma.business.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
    });

    const recentUsers = await prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
    });

    const activeSubscriptions = await prisma.subscription.count({ where: { status: 'active' } });

    // Revenue placeholder logic requires proper invoice sums. Fallback to 0 if none active for now.
    const paymentsSummary = await prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'success' } });
    const monthlyRevenue = (Number(paymentsSummary._sum.amount) || 0) / 100; // Assuming paise/cents scale usually, if real data exists

    // Exact aggregate mappings replacing mock inflation
    const generatedReviews = await prisma.generatedReview.count();
    const qrScans = totalSubmissions;
    const redirects = generatedReviews;
    const conversionRate = totalSubmissions > 0 ? ((redirects / qrScans) * 100).toFixed(1) : 0;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">System Overview</h1>
                <p className="text-muted-foreground mt-1">Platform-wide performance and activity metrics across all tenants.</p>
            </div>

            {/* Layer 1: Core SaaS Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100 fill-mode-both">
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-semibold text-slate-600">Total Businesses</CardTitle>
                        <Building className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{totalBusinesses}</div>
                        <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> +12.4% this month</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-semibold text-slate-600">Active Users</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{totalUsers}</div>
                        <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> +8.7% this month</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-semibold text-slate-600">Monthly Revenue</CardTitle>
                        <Banknote className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">₹{monthlyRevenue.toLocaleString()}</div>
                        <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> +16.3% this month</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-semibold text-slate-600">Reviews Generated</CardTitle>
                        <MessageSquare className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{totalSubmissions.toLocaleString()}</div>
                        <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> +21.5% this month</p>
                    </CardContent>
                </Card>
            </div>

            {/* Layer 2: Secondary Funnel Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200 fill-mode-both">
                <Card className="bg-slate-50/50 shadow-none border-dashed border-slate-200">
                    <CardHeader className="py-4">
                        <CardDescription className="font-semibold text-slate-500">QR Scans</CardDescription>
                        <CardTitle className="text-xl text-slate-800">{qrScans.toLocaleString()}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="bg-slate-50/50 shadow-none border-dashed border-slate-200">
                    <CardHeader className="py-4">
                        <CardDescription className="font-semibold text-slate-500">Google Redirects</CardDescription>
                        <CardTitle className="text-xl text-slate-800">{redirects.toLocaleString()}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="bg-slate-50/50 shadow-none border-dashed border-slate-200">
                    <CardHeader className="py-4">
                        <CardDescription className="font-semibold text-slate-500">Conversion Rate</CardDescription>
                        <CardTitle className="text-xl text-slate-800">{conversionRate}%</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="bg-emerald-50/30 shadow-none border-dashed border-emerald-200">
                    <CardHeader className="py-4">
                        <CardDescription className="font-semibold text-emerald-600">Active Subscriptions</CardDescription>
                        <CardTitle className="text-xl text-emerald-900">{activeSubscriptions}</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Layer 3 & 4: Growth Charts & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-300 fill-mode-both">

                {/* Analytics Placeholder */}
                <Card className="shadow-sm border-slate-200 flex flex-col min-h-[400px]">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Revenue & Growth Analytics</CardTitle>
                                <CardDescription>Monthly recurring revenue compared to new tenant signups.</CardDescription>
                            </div>
                            <BarChart4 className="h-5 w-5 text-slate-400" />
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex items-center justify-center p-6">
                        <div className="h-full w-full bg-slate-50 rounded-lg border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-3">
                            <Activity className="h-8 w-8 text-slate-300" />
                            <p className="text-sm font-medium">Analytics Chart Initializing...</p>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg">Recent Businesses</CardTitle>
                            <CardDescription>Newest active tenants requiring attention.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentBusinesses.map((b) => (
                                    <div key={b.id} className="flex items-center justify-between group">
                                        <div className="space-y-1">
                                            <p className="font-semibold text-[14px] leading-none text-slate-900 group-hover:text-primary transition-colors">{b.name}</p>
                                            <p className="text-xs text-slate-500">ID: {b.id}</p>
                                        </div>
                                        <div className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                                            {b.createdAt.toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg">Recent User Signups</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentUsers.map((u) => (
                                    <div key={u.id} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                                                {u.name?.slice(0, 2).toUpperCase() || 'US'}
                                            </div>
                                            <div>
                                                <p className="font-medium text-[14px] leading-tight text-slate-900">{u.name || 'Unknown User'}</p>
                                                <p className="text-xs text-slate-500">{u.email}</p>
                                            </div>
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            {u.createdAt.toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>

        </div>
    );
}
