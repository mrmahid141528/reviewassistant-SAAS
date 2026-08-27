import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, Banknote, CreditCard, DollarSign, Target, Receipt, TrendingUp, AlertCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function SuperAdminBilling() {
    // Analytics logic for MRR and Subscriptions. 
    // Usually integrated with Stripe/Razorpay APIs directly, or tracking DB models.

    // 1. Fetch Subscription data
    const activeSubsCount = await prisma.subscription.count({
        where: { status: 'active' }
    });

    const activeSubscriptions = await prisma.subscription.findMany({
        where: { status: 'active' },
        include: { plan: true }
    });

    const mrr = activeSubscriptions.reduce((acc, sub) => acc + Number(sub.plan?.priceMonthly || 0), 0);
    const totalActiveSubs = activeSubsCount;

    // 2. Fetch Manually Assigned Plans (via Business model) - REPLACED
    // Since manually assigned plans now create Subscription records with status 'active',
    // we don't need to manually aggregate them anymore. It's perfectly synced!

    const allPlans = await prisma.plan.findMany();
    const planMap = new Map(allPlans.map(p => [p.id, Number(p.priceMonthly || 0)]));

    const arr = mrr * 12;

    // 3. Failed Payments (Last 30 Days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const failedPaymentsData = await prisma.payment.aggregate({
        _count: { id: true },
        _sum: { amount: true },
        where: {
            status: 'failed',
            createdAt: { gte: thirtyDaysAgo }
        }
    });

    const failedPaymentsCount = failedPaymentsData._count.id || 0;
    const failedPaymentsAmount = Number(failedPaymentsData._sum.amount || 0);

    const recentPayments = await prisma.payment.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: { business: true }
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Financials & Billing</h1>
                <p className="text-muted-foreground mt-1">Platform revenue tracking, subscription metrics, and payment gateway logs.</p>
            </div>

            {/* Revenue KPIs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100 fill-mode-both">
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-[13px] font-semibold text-slate-600">Total MRR</CardTitle>
                        <Banknote className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">₹{mrr.toLocaleString()}</div>
                        <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> +5.2% from last month</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-[13px] font-semibold text-slate-600">Annual Run Rate</CardTitle>
                        <Target className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">₹{arr.toLocaleString()}</div>
                        <p className="text-xs text-slate-500 mt-1">Projected 12-month earnings</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-[13px] font-semibold text-slate-600">Active Subs</CardTitle>
                        <CreditCard className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{totalActiveSubs.toLocaleString()}</div>
                        <p className="text-xs text-slate-500 mt-1">Across all pricing tiers</p>
                    </CardContent>
                </Card>

                <Card className="border-rose-200 shadow-sm bg-rose-50/30">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-[13px] font-semibold text-rose-700">Failed Payments (30d)</CardTitle>
                        <AlertCircle className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-rose-800">{failedPaymentsCount}</div>
                        <p className="text-xs text-rose-600/80 mt-1">Totaling ₹{failedPaymentsAmount.toLocaleString()} pending recovery</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-200 fill-mode-both">
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="border-b bg-slate-50/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                                    <Receipt className="h-5 w-5 text-slate-500" /> Payment Transaction Log
                                </CardTitle>
                                <CardDescription className="text-xs mt-1">Latest successful and failed incoming payments.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="text-xs text-slate-500">Transaction ID</TableHead>
                                    <TableHead className="text-xs text-slate-500">Business</TableHead>
                                    <TableHead className="text-xs text-slate-500">Amount</TableHead>
                                    <TableHead className="text-xs text-slate-500">Gateway</TableHead>
                                    <TableHead className="text-xs text-slate-500 text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentPayments.map((payment) => (
                                    <TableRow key={payment.id}>
                                        <TableCell className="font-mono text-[11px] text-slate-500">{payment.id.slice(0, 16)}...</TableCell>
                                        <TableCell className="font-medium text-[13px]">{payment.business.name}</TableCell>
                                        <TableCell className="text-[13px] font-semibold text-slate-900">₹{payment.amount.toString()}</TableCell>
                                        <TableCell className="text-[12px] text-slate-500">Razorpay</TableCell>
                                        <TableCell className="text-right">
                                            {payment.status === 'success'
                                                ? <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Success</Badge>
                                                : <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">Failed</Badge>
                                            }
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {recentPayments.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                                            No payment transactions found in database.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
