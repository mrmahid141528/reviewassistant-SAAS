import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare } from "lucide-react";

export default async function BusinessReviewsTab(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;

    const submissions = await prisma.feedbackSubmission.findMany({
        where: { businessId: id },
        include: {
            campaign: true,
            customer: true,
            answers: true
        },
        orderBy: { createdAt: 'desc' },
        take: 100 // Hard limit for preview
    });

    if (!submissions) notFound();

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Feedback & Reviews</h2>
                    <p className="text-sm text-muted-foreground mt-1">Recent feedback submissions from this tenant's campaigns. (Last 100)</p>
                </div>
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border border-blue-200">
                    Total: {submissions.length} shown
                </Badge>
            </div>

            <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50 border-b">
                    <CardTitle className="text-lg">Submissions Ledger</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto max-h-[800px] overflow-y-auto">
                        <table className="w-full text-sm text-left relative">
                            <thead className="bg-slate-50/50 border-b border-slate-200 sticky top-0 z-10 hidden md:table-header-group">
                                <tr>
                                    <th className="px-6 py-4 font-medium text-slate-500">Customer</th>
                                    <th className="px-6 py-4 font-medium text-slate-500">Rating</th>
                                    <th className="px-6 py-4 font-medium text-slate-500">Campaign</th>
                                    <th className="px-6 py-4 font-medium text-slate-500">Submitted At</th>
                                    <th className="px-6 py-4 font-medium text-slate-500">Source</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {submissions.map(sub => (
                                    <tr key={sub.id} className="hover:bg-slate-50/50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                                                    <MessageSquare className="h-3.5 w-3.5 text-slate-500" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">{sub.customer?.name || "Anonymous Customer"}</p>
                                                    {sub.customer?.email && <p className="text-xs text-slate-500">{sub.customer.email}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-amber-500">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star key={i} className={`h-4 w-4 ${i < sub.rating ? 'fill-current' : 'text-slate-200'}`} />
                                                ))}
                                                <span className="ml-1 text-slate-600 font-medium text-xs">{sub.rating}/5</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-700 font-medium">
                                            {sub.campaign?.name || "Deleted Campaign"}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-[13px]">
                                            {sub.createdAt.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className="capitalize text-xs">{sub.source || "direct"}</Badge>
                                        </td>
                                    </tr>
                                ))}
                                {submissions.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                                            No feedback submissions collected yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
