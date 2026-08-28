"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Sparkles, TrendingUp, Users, CheckCircle2 } from "lucide-react";
import { AnalyticsChart } from "@/components/dashboard/AnalyticsChart";
import { DashboardDateFilter } from "@/components/dashboard/DashboardDateFilter";

interface MainAnalyticsClientProps {
    timeseries: { date: string, rawDate: string, sessions: number, generated: number }[];
    recentFeedbacks: { id: string, rating: number, date: string, rawDate: string, location: string, hasGenerated: boolean }[];
    overallRating: string;
    totalFeedbacks: number;
}

export function MainAnalyticsClient({ timeseries, recentFeedbacks, overallRating, totalFeedbacks }: MainAnalyticsClientProps) {

    // Quick CSV export for V1.5 spec
    const handleExport = () => {
        const headers = ["ID", "Rating", "Date", "Location", "Draft Generated"];
        const rows = recentFeedbacks.map(f => [
            f.id,
            f.rating.toString(),
            `"${f.date}"`,
            `"${f.location}"`,
            f.hasGenerated ? 'Yes' : 'No'
        ]);
        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `review_analytics_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Calculate aggregated totals for chart mapping
    const chartMapping = timeseries.map(ts => ({
        date: ts.date,
        rawDate: ts.rawDate,
        reviews: ts.generated,
        scans: ts.sessions
    }));

    return (
        <div className="space-y-8 max-w-6xl pb-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Advanced Analytics</h2>
                    <p className="text-muted-foreground mt-1">Deep dive into your customer feedback funnels and locations.</p>
                </div>
                <Button variant="outline" className="shrink-0" onClick={handleExport}>
                    <Download className="w-4 h-4 mr-2" /> Export CSV
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-indigo-900 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-indigo-500" /> AI Growth Insights
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-indigo-800">
                            <strong>Summary:</strong> Based on the last 30 days, customers visiting the Main Location between 2 PM and 5 PM are 14% more likely to generate a 5-star review using the AI assistant. Ensure QR codes remain highly visible during peak hours.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground tracking-tight flex justify-between">
                            Total Feedback Volume <Users className="w-4 h-4 text-primary" />
                        </CardTitle>
                        <div className="text-3xl font-bold">{totalFeedbacks}</div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center text-xs text-emerald-600 font-medium">
                            <TrendingUp className="w-3 h-3 mr-1" /> +24.5% from last month
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground tracking-tight flex justify-between">
                            Global Average Rating <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        </CardTitle>
                        <div className="text-3xl font-bold">{overallRating}</div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center text-xs text-muted-foreground">
                            Across all connected locations and campaigns.
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Generations Trend</CardTitle>
                            <CardDescription>Volume of reviews successfully drafted by the AI assistant.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="h-[350px]">
                    <AnalyticsChart data={chartMapping} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Raw Session Logs</CardTitle>
                    <CardDescription>Detailed log of recent customer interactions through the funnel.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-hidden">
                        {/* Desktop Table Content */}
                        <table className="hidden md:table w-full text-sm text-left">
                            <thead className="bg-muted text-muted-foreground font-medium text-xs px-4 border-b">
                                <tr>
                                    <th className="py-3 px-4">Date</th>
                                    <th className="py-3 px-4">Location</th>
                                    <th className="py-3 px-4">Rating</th>
                                    <th className="py-3 px-4">Draft Generated?</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y bg-white">
                                {recentFeedbacks.length > 0 ? recentFeedbacks.map(fb => (
                                    <tr key={fb.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="py-3 px-4">{fb.date}</td>
                                        <td className="py-3 px-4 font-medium">{fb.location}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex px-2 py-0.5 rounded-full w-fit bg-primary/10 text-primary font-bold">
                                                {fb.rating}.0
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            {fb.hasGenerated ? (
                                                <span className="text-emerald-600 font-semibold flex items-center"><CheckCircle2 className="w-4 h-4 mr-1.5" /> Yes</span>
                                            ) : (
                                                <span className="text-muted-foreground">Logged out</span>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="h-32 text-center text-muted-foreground">No data available for the selected period.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Mobile Stacked List Content */}
                        <div className="md:hidden divide-y bg-background">
                            {recentFeedbacks.length > 0 ? recentFeedbacks.map(fb => (
                                <div key={fb.id} className="p-4 flex flex-col space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-semibold text-sm">{fb.location}</div>
                                            <div className="text-xs text-muted-foreground mt-0.5">{fb.date}</div>
                                        </div>
                                        <div className="flex px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-sm border border-primary/20">
                                            ⭐ {fb.rating}.0
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center text-sm pt-2 border-t border-dashed">
                                        <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">AI Draft Generated</span>
                                        {fb.hasGenerated ? (
                                            <span className="text-emerald-600 font-bold flex items-center bg-emerald-50 px-2 py-0.5 rounded-full text-xs">
                                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> YES
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground font-medium text-xs">
                                                Logged Out
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )) : (
                                <div className="h-32 flex items-center justify-center text-center text-muted-foreground text-sm">
                                    No data available for the selected period.
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
