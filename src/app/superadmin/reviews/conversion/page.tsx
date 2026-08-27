import prisma from "@/lib/prisma";
import { TrendingUp, BarChart4, ArrowUpRight } from "lucide-react";

export const metadata = {
    title: "Conversion Leaderboard | SaaS Control",
};

export default async function SuperadminConversionPage() {
    // We fetch aggregate counts mapped by business
    const businesses = await prisma.business.findMany({
        select: {
            id: true,
            name: true,
            slug: true,
            _count: {
                select: {
                    feedbackSubmissions: true,
                    reviewRequests: true
                }
            }
        }
    });

    const leaderboard = businesses.map(b => {
        const scans = b._count.feedbackSubmissions;
        const redirects = b._count.reviewRequests;
        // Approximation: since reviewRequests are created when AI generates review, 
        // ideally we would check clickedAt. For this leaderboard we'll consider all reviewRequests as highly indicative.
        const conversion = scans > 0 ? (redirects / scans) * 100 : 0;
        return {
            ...b,
            conversion,
            scans,
            redirects
        };
    }).sort((a, b) => b.conversion - a.conversion);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Conversion Leaderboard</h2>
                    <p className="text-sm text-slate-500">Compare which tenants are most effectively turning QR scans into Google integrations.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-2">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Rank</th>
                                <th className="px-6 py-4 font-semibold">Tenant</th>
                                <th className="px-6 py-4 font-semibold text-right">Total Scans</th>
                                <th className="px-6 py-4 font-semibold text-right">Redirects</th>
                                <th className="px-6 py-4 font-semibold text-right">Conversion Rate</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {leaderboard.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        No conversion data available yet.
                                    </td>
                                </tr>
                            ) : (
                                leaderboard.map((b, idx) => (
                                    <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-400">
                                            #{idx + 1}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900">{b.name}</div>
                                            <div className="text-xs text-slate-500 mt-0.5">/{b.slug}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-slate-900">
                                            {b.scans.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-slate-900">
                                            {b.redirects.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <span className="font-bold text-emerald-600">{b.conversion.toFixed(1)}%</span>
                                                <TrendingUp className="h-4 w-4 text-emerald-500" />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
