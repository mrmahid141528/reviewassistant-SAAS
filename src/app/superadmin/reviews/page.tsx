import prisma from "@/lib/prisma";
import { ArrowRight, QrCode, PenTool, Copy, ExternalLink, Activity } from "lucide-react";

export const metadata = {
    title: "Reviews Overview | SaaS Control",
};

export default async function SuperadminReviewsOverviewPage() {
    const [
        totalScans,
        totalGenerated,
        totalCopied,
        totalRedirects
    ] = await Promise.all([
        prisma.feedbackSubmission.count(),
        prisma.generatedReview.count(),
        prisma.generatedReview.count({ where: { status: 'copied' } }),
        prisma.reviewRequest.count({ where: { clickedAt: { not: null } } })
    ]);

    const conversionRate = totalScans > 0 ? ((totalRedirects / totalScans) * 100).toFixed(1) : "0.0";

    const funnelStages = [
        { label: "QR Scans / Started", value: totalScans, icon: QrCode, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-200" },
        { label: "Reviews Generated", value: totalGenerated, icon: PenTool, color: "text-indigo-500", bg: "bg-indigo-50", border: "border-indigo-200" },
        { label: "Reviews Copied", value: totalCopied, icon: Copy, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200" },
        { label: "Google Redirects", value: totalRedirects, icon: ExternalLink, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-200" },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="md:col-span-1 border rounded-xl bg-slate-900 text-white p-6 shadow-sm flex flex-col justify-center items-center text-center">
                    <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Platform Conversion</h3>
                    <div className="text-4xl font-bold text-emerald-400">{conversionRate}%</div>
                    <p className="text-xs text-slate-400 mt-2">Overall scan to redirect</p>
                </div>
                <div className="md:col-span-4 border rounded-xl bg-white p-4 sm:p-6 shadow-sm grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 items-start lg:items-center">
                    {funnelStages.map((stage, idx) => (
                        <div key={idx} className="flex relative items-center w-full">
                            <div className="flex flex-col items-center text-center w-full relative z-10">
                                <div className={`h-14 w-14 rounded-full flex items-center justify-center border-4 ${stage.bg} ${stage.border} shadow-sm bg-white mb-3`}>
                                    <stage.icon className={`h-6 w-6 ${stage.color}`} />
                                </div>
                                <div className="text-2xl font-bold text-slate-900 mb-1">{stage.value.toLocaleString()}</div>
                                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">{stage.label}</div>
                            </div>
                            {idx < funnelStages.length - 1 && (
                                <div className="hidden lg:block flex-1 h-0.5 bg-slate-200 -mx-4 relative top-[-18px]">
                                    <ArrowRight className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-300 h-4 w-4 bg-white" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div className="border rounded-xl bg-white p-6 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-slate-500" /> Platform Event Metrics
                    </h3>
                    <p className="text-sm text-slate-500">
                        Historical conversion data visualization will be plotted here indicating platform-wide stability over the last 30 days.
                    </p>
                </div>
            </div>
        </div>
    );
}
