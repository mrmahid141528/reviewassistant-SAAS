import prisma from "@/lib/prisma";
import { QrCode, PenTool, ExternalLink, ShieldAlert, CheckCircle2 } from "lucide-react";

export const metadata = {
    title: "Review Activity | SaaS Control",
};

export default async function SuperadminActivityPage() {
    const [submissions, generations, redirects] = await Promise.all([
        prisma.feedbackSubmission.findMany({
            take: 30,
            orderBy: { createdAt: 'desc' },
            include: { business: { select: { name: true } } }
        }),
        prisma.generatedReview.findMany({
            take: 30,
            orderBy: { createdAt: 'desc' },
            include: { submission: { include: { business: { select: { name: true } } } } }
        }),
        prisma.reviewRequest.findMany({
            where: { clickedAt: { not: null } },
            take: 30,
            orderBy: { clickedAt: 'desc' },
            include: { business: { select: { name: true } } }
        })
    ]);

    type FeedEvent = { id: string; type: string; title: string; business: string; time: Date; icon: any; color: string; bg: string };

    let events: FeedEvent[] = [];

    submissions.forEach(sub => {
        events.push({
            id: `sub-${sub.id}`,
            type: 'scan',
            title: 'QR Code Scanned & Feedback Started',
            business: sub.business.name,
            time: sub.createdAt,
            icon: QrCode,
            color: 'text-blue-500',
            bg: 'bg-blue-50'
        });
    });

    generations.forEach(gen => {
        events.push({
            id: `gen-${gen.id}`,
            type: 'generated',
            title: 'AI Review Generated',
            business: gen.submission.business.name,
            time: gen.createdAt,
            icon: PenTool,
            color: 'text-indigo-500',
            bg: 'bg-indigo-50'
        });

        if (gen.status === 'copied') {
            events.push({
                id: `copy-${gen.id}`,
                type: 'copied',
                title: 'AI Review Copied to Clipboard',
                business: gen.submission.business.name,
                time: new Date(gen.createdAt.getTime() + 15000), // Approximate timestamp since DB only stores boolean
                icon: CheckCircle2,
                color: 'text-amber-500',
                bg: 'bg-amber-50'
            });
        }
    });

    redirects.forEach(req => {
        if (req.clickedAt) {
            events.push({
                id: `click-${req.id}`,
                type: 'redirect',
                title: 'Successfully Redirected to Google',
                business: req.business.name,
                time: req.clickedAt,
                icon: ExternalLink,
                color: 'text-emerald-500',
                bg: 'bg-emerald-50'
            });
        }
    });

    // Sort combined events descending
    events.sort((a, b) => b.time.getTime() - a.time.getTime());
    events = events.slice(0, 50); // Show only top 50

    const timeAgo = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " ms ago";
        return Math.floor(seconds) + " secs ago";
    };

    return (
        <div className="space-y-4 max-w-4xl">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Live Activity Feed</h2>
                    <p className="text-sm text-slate-500">Real-time chronological events from end-users across all tenants.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mt-2 relative">
                <div className="absolute top-0 bottom-0 left-10 w-px bg-slate-200 z-0 hidden sm:block"></div>

                <div className="space-y-6 relative z-10">
                    {events.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 flex flex-col items-center">
                            <ShieldAlert className="h-8 w-8 text-slate-300 mb-3" />
                            <p>No recorded SaaS activity blocks.</p>
                        </div>
                    ) : (
                        events.map((ev, i) => (
                            <div key={`${ev.id}-${i}`} className="flex gap-4 sm:gap-6 items-start group">
                                <div className="mt-1 flex flex-col items-center gap-2">
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 border border-white ring-4 ring-white ${ev.bg}`}>
                                        <ev.icon className={`h-4 w-4 ${ev.color}`} />
                                    </div>
                                </div>
                                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 px-4 flex-1 shadow-sm group-hover:shadow-md group-hover:border-slate-200 transition-all">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">{ev.title}</p>
                                            <p className="text-xs text-slate-500 mt-0.5"><span className="font-medium text-slate-700">{ev.business}</span> • User Session</p>
                                        </div>
                                        <div className="text-xs text-slate-400 font-medium bg-white px-2 py-1 rounded shadow-sm border border-slate-100 whitespace-nowrap">
                                            {timeAgo(ev.time).replace("ms", "mins")}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
