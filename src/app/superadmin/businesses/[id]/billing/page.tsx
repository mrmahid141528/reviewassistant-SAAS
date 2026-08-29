import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, History, Clock } from "lucide-react";

export default async function BusinessBillingTab(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;

    const business = await prisma.business.findUnique({
        where: { id },
        include: {
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

    if (!business) notFound();

    const activeSubscription = business.subscriptions.find(s => s.status === 'active' || s.status === 'trialing');

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            <div>
                <h2 className="text-xl font-bold text-slate-900">Billing & Subscription</h2>
                <p className="text-sm text-muted-foreground mt-1">Manage tenant plans, view payment history, and payment configurations.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="bg-slate-50 border-b">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-slate-500" /> Current Plan
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        {activeSubscription ? (
                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-2xl font-bold text-slate-900">{activeSubscription.plan.name}</p>
                                        <p className="text-sm text-slate-500">Provider Sub ID: <span className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">{activeSubscription.providerSubscriptionId}</span></p>
                                    </div>
                                    <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                                        {activeSubscription.status.toUpperCase()}
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-4 border-t pt-4 border-slate-100">
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">Current Period Start</p>
                                        <p className="text-sm font-medium">{activeSubscription.currentPeriodStart.toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">Current Period End</p>
                                        <p className="text-sm font-medium flex items-center gap-1">
                                            <Clock className="h-3 w-3 text-amber-500" />
                                            {activeSubscription.currentPeriodEnd.toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="py-6 text-center">
                                <p className="text-slate-500 font-medium">No Active Subscription</p>
                                <p className="text-xs text-slate-400 mt-1">Tenant is either unpaid or using a free allocation.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="bg-slate-50 border-b">
                        <CardTitle className="text-lg">Gateway Details</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-500">Razorpay Customer ID</span>
                            <span className="font-mono text-sm bg-slate-50 px-2 py-1 rounded border border-slate-100">{business.razorpayCustomerId || "N/A"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-500">Subscribed Plan ID</span>
                            <span className="font-mono text-sm bg-slate-50 px-2 py-1 rounded border border-slate-100">{business.razorpayPlanId || "N/A"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-500">Manual Plan Override</span>
                            <Badge variant="outline" className="text-xs text-slate-400">None</Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="shadow-sm border-slate-200 mt-6">
                <CardHeader className="bg-slate-50 border-b flex flex-row items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <History className="h-5 w-5 text-slate-500" /> Payment History
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50/50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 font-medium text-slate-500">Transaction ID</th>
                                <th className="px-6 py-3 font-medium text-slate-500">Date</th>
                                <th className="px-6 py-3 font-medium text-slate-500">Amount</th>
                                <th className="px-6 py-3 font-medium text-slate-500">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {business.payments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-3 font-mono text-xs text-slate-600">
                                        {payment.providerPaymentId}
                                    </td>
                                    <td className="px-6 py-3 text-slate-500">
                                        {payment.createdAt.toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-3 font-semibold text-slate-700">
                                        {payment.currency} {(Number(payment.amount) / 100).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-3">
                                        <Badge variant="outline" className={payment.status === 'captured' || payment.status === 'succeeded' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}>
                                            {payment.status}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                            {business.payments.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                        No recent payments on record.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
