import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building, ShieldAlert, MonitorPlay, Users, Target, Activity, Settings, Calendar, ExternalLink, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImpersonateButton } from "./ImpersonateButton";

export default async function BusinessDetailsPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;

    // Fetch detailed records
    const business = await prisma.business.findUnique({
        where: { id: params.id },
        include: {
            members: {
                include: { user: true }
            },
            campaigns: true,
            _count: {
                select: {
                    feedbackSubmissions: true,
                    generatedReviews: true,
                    locations: true,
                }
            },
            subscriptions: {
                include: { plan: true },
                orderBy: { createdAt: 'desc' }
            },
            payments: {
                orderBy: { createdAt: 'desc' },
                take: 10
            }
        }
    });

    // Fetch redemptions concurrently to bypass missing Prisma reverse relation
    const couponRedemptions = await prisma.couponRedemption.findMany({
        where: { businessId: params.id },
        include: { coupon: true }
    });

    if (!business) {
        notFound();
    }

    const activeSubscription = business.subscriptions.find(sub => sub.status === 'active');
    const historySubscriptions = business.subscriptions.filter(sub => sub.id !== activeSubscription?.id);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10" >
            {/* Header & Impersonation */}
            < div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm" >
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0 shadow-sm">
                        <Building className="h-7 w-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                            {business.name}
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${business.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}`}>
                                {business.status}
                            </span>
                        </h1>
                        <p className="text-sm text-slate-500 font-mono mt-0.5 max-w-sm truncate">{business.id} • {business.slug}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Link href={`/superadmin/businesses/${business.id}/settings`}>
                        <Button variant="outline" className="gap-2 shadow-sm">
                            <Settings className="h-4 w-4" /> Edit Tenant
                        </Button>
                    </Link>
                    <ImpersonateButton businessId={business.id} businessName={business.name} />
                </div>
            </div >

            {/* Deep Dive Tabs */}
            < Tabs defaultValue="overview" className="w-full" >
                <TabsList className="bg-slate-100 rounded-lg p-1">
                    <TabsTrigger value="overview" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm text-[13px] px-6">Overview</TabsTrigger>
                    <TabsTrigger value="users" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm text-[13px] px-6">Users & Roles</TabsTrigger>
                    <TabsTrigger value="campaigns" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm text-[13px] px-6">QR Campaigns</TabsTrigger>
                    <TabsTrigger value="subscription" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm text-[13px] px-6">Subscription</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6 space-y-6">
                    {/* Utilization KPIs */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="shadow-sm border-slate-200">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-[13px] font-semibold text-slate-600">Total Locations</CardTitle>
                                <Target className="h-4 w-4 text-slate-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-900">{business._count.locations}</div>
                            </CardContent>
                        </Card>
                        <Card className="shadow-sm border-slate-200">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-[13px] font-semibold text-slate-600">Reviews Submitted</CardTitle>
                                <Activity className="h-4 w-4 text-purple-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-900">{business._count.feedbackSubmissions.toLocaleString()}</div>
                            </CardContent>
                        </Card>
                        <Card className="shadow-sm border-slate-200">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-[13px] font-semibold text-slate-600">AI Drafts Hit</CardTitle>
                                <Target className="h-4 w-4 text-emerald-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-900">{business._count.generatedReviews.toLocaleString()}</div>
                            </CardContent>
                        </Card>
                        <Card className="shadow-sm border-slate-200">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-[13px] font-semibold text-slate-600">Member Count</CardTitle>
                                <Users className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-900">{business.members.length}</div>
                            </CardContent>
                        </Card>
                    </div>

                </TabsContent>

                <TabsContent value="users">
                    <Card className="shadow-sm border-slate-200 mt-6">
                        <CardHeader>
                            <CardTitle>Tenant Users</CardTitle>
                            <CardDescription>Accounts bound to this SaaS instance.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {business.members.map((m) => (
                                    <div key={m.id} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
                                        <div>
                                            <p className="font-semibold text-slate-900 text-sm">{m.user.name || "No Name"}</p>
                                            <p className="text-xs text-slate-500">{m.user.email}</p>
                                        </div>
                                        <div>
                                            <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold uppercase">{m.role}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="campaigns">
                    <Card className="shadow-sm border-slate-200 mt-6">
                        <CardHeader>
                            <CardTitle>Active Campaigns</CardTitle>
                            <CardDescription>QR codes registered by this business.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {business.campaigns.map((c) => (
                                    <div key={c.id} className="flex justify-between items-center border-b border-slate-100 pb-3 last:border-0">
                                        <p className="font-medium text-slate-800 text-[14px]">{c.name}</p>
                                        <p className="text-xs text-slate-500 font-mono">Status: {c.status}</p>
                                    </div>
                                ))}
                                {business.campaigns.length === 0 && (
                                    <p className="text-sm text-slate-500 py-4 text-center">No campaigns initialized.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="subscription" className="mt-6 space-y-6">
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="border-b bg-slate-50/50">
                            <CardTitle>Current Plan</CardTitle>
                            <CardDescription>The active SaaS premium tier for this tenant.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4 pt-4">
                                {activeSubscription ? (
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-2 border-emerald-500/20 bg-emerald-50/50 rounded-lg p-5 shadow-sm">
                                        <div>
                                            <p className="font-semibold text-slate-900 flex items-center gap-2 text-lg">
                                                {activeSubscription.plan.name} Plan
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                                                    ACTIVE
                                                </span>
                                            </p>
                                            <p className="text-sm text-slate-500 mt-1 font-mono">ID: {activeSubscription.providerSubscriptionId}</p>
                                            {(() => {
                                                const redemption = couponRedemptions.find(r => r.subscriptionId === activeSubscription.id);
                                                if (!redemption) return null;
                                                return (
                                                    <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
                                                        <span className="flex items-center gap-1"><Tag className="h-3 w-3" /> {(redemption as any).coupon?.code}</span>
                                                        <span className="font-normal border-l border-amber-300 pl-1.5 ml-0.5">{(redemption as any).coupon?.value}{(redemption as any).coupon?.type === 'percentage' ? '%' : ' INR'} OFF applied</span>
                                                    </div>
                                                )
                                            })()}
                                        </div>
                                        <div className="mt-4 md:mt-0 text-right">
                                            <p className="text-sm font-bold text-slate-900">Period Ends</p>
                                            <p className="text-sm text-slate-600">{activeSubscription.currentPeriodEnd.toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center p-8 bg-slate-50 border border-dashed rounded-lg">
                                        <ShieldAlert className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                                        <p className="text-sm font-medium text-slate-600">No active subscription found.</p>
                                        <p className="text-xs text-slate-400 mt-1">Tenant is either on a free tier or trial.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {historySubscriptions.length > 0 && (
                        <Card className="shadow-sm border-slate-200 mt-6">
                            <CardHeader className="border-b bg-slate-50/50">
                                <CardTitle>Subscription History</CardTitle>
                                <CardDescription>Previous or conflicting subscription records.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4 pt-4">
                                    {historySubscriptions.map((sub) => (
                                        <div key={sub.id} className="flex flex-col md:flex-row justify-between items-start md:items-center border border-slate-100 rounded-lg p-3 bg-slate-50">
                                            <div>
                                                <p className="font-medium text-slate-700 flex items-center gap-2 text-sm">
                                                    {sub.plan.name} Plan
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${sub.status === 'active' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-600'}`}>
                                                        {sub.status === 'active' ? 'Replaced' : sub.status}
                                                    </span>
                                                </p>
                                                <p className="text-xs text-slate-400 mt-0.5 font-mono">{sub.providerSubscriptionId}</p>
                                            </div>
                                            <div className="mt-2 md:mt-0 text-right">
                                                <p className="text-xs text-slate-500">{sub.createdAt.toLocaleDateString()} - {sub.currentPeriodEnd.toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card className="shadow-sm border-slate-200 mt-6">
                        <CardHeader className="border-b bg-slate-50/50">
                            <CardTitle>Recent Payments</CardTitle>
                            <CardDescription>Transaction logs for this tenant.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4 pt-4">
                                {business.payments.map((payment) => (
                                    <div key={payment.id} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
                                        <div>
                                            <p className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                                                ₹{payment.amount.toString()}
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${payment.status === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                                    {payment.status}
                                                </span>
                                            </p>
                                            <p className="text-xs text-slate-500 font-mono mt-0.5">{payment.providerPaymentId || payment.id}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-slate-500">{payment.createdAt.toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))}
                                {business.payments.length === 0 && (
                                    <p className="text-sm text-slate-500 py-4 text-center">No payment history available.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

            </Tabs >
        </div >
    );
}
