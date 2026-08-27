import prisma from "@/lib/prisma";
import { Star, MessageSquare, CheckCircle2, CircleDashed } from "lucide-react";

export const metadata = {
    title: "All Reviews | SaaS Control",
};

export default async function SuperadminAllReviewsPage() {
    const reviews = await prisma.feedbackSubmission.findMany({
        orderBy: { submittedAt: 'desc' },
        take: 100,
        include: {
            business: { select: { name: true, slug: true } },
            customer: { select: { name: true, email: true } },
            campaign: { select: { name: true } },
            requests: { select: { clickedAt: true, status: true }, take: 1 },
            reviews: { select: { id: true, status: true }, take: 1 }
        }
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Platform Feedback Log</h2>
                    <p className="text-sm text-slate-500">Comprehensive datatable of all end-user sessions and review generations.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Tenant & Session</th>
                                <th className="px-6 py-4 font-semibold">Rating</th>
                                <th className="px-6 py-4 font-semibold">Funnel Progress</th>
                                <th className="text-right px-6 py-4 font-semibold">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {reviews.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <MessageSquare className="h-8 w-8 text-slate-300 mb-3" />
                                            <p className="font-medium text-slate-600">No reviews captured yet</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                reviews.map((review) => {
                                    const latestRequest = review.requests[0];
                                    const latestGenerated = review.reviews[0];

                                    const isGenerated = !!latestGenerated;
                                    const isEdited = latestGenerated?.status === 'edited' || latestGenerated?.status === 'copied';
                                    const isCopied = latestGenerated?.status === 'copied';
                                    const isRedirected = !!latestRequest?.clickedAt;

                                    const sessionIcon = (active: boolean) => active
                                        ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                        : <CircleDashed className="h-4 w-4 text-slate-200" />;

                                    return (
                                        <tr key={review.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900">{review.business.name}</div>
                                                <div className="text-xs text-slate-500 mt-0.5">
                                                    Cust: {review.customer ? (review.customer.name || review.customer.email || "Anonymous") : "Anonymous"}
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-mono mt-1">ID: {review.id.substring(0, 8)}...</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1">
                                                    <span className="font-bold text-slate-900">{review.rating}</span>
                                                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                                </div>
                                                <div className="mt-1">
                                                    {review.rating >= 4
                                                        ? <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Positive</span>
                                                        : <span className="text-[10px] uppercase font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">Critical</span>
                                                    }
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-4">
                                                    <div className="flex flex-col items-center gap-1 text-[11px] font-medium text-slate-500">
                                                        {sessionIcon(isGenerated)}
                                                        <span>Generated</span>
                                                    </div>
                                                    <div className="flex flex-col items-center gap-1 text-[11px] font-medium text-slate-500">
                                                        {sessionIcon(isEdited)}
                                                        <span>Edited</span>
                                                    </div>
                                                    <div className="flex flex-col items-center gap-1 text-[11px] font-medium text-slate-500">
                                                        {sessionIcon(isCopied)}
                                                        <span>Copied</span>
                                                    </div>
                                                    <div className="flex flex-col items-center gap-1 text-[11px] font-medium text-slate-500">
                                                        {sessionIcon(isRedirected)}
                                                        <span>Redirected</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right text-slate-500 whitespace-nowrap">
                                                {new Date(review.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                <div className="text-xs mt-0.5">{new Date(review.submittedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
