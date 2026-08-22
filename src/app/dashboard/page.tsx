import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ScanFace, MessageSquare, Star, ArrowUpRight, AlertTriangle } from "lucide-react";
import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { subDays, format } from "date-fns"
import { AnalyticsChart } from "@/components/dashboard/AnalyticsChart"

export default async function DashboardOverviewPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let submissionsCount = 0
    let generatedCount = 0
    let avgRating = 0
    let needsAttention: { id: string, rating: number, createdAt: Date }[] = []
    let recentActivity: any[] = []
    let chartData: { date: string, rawDate: string, reviews: number }[] = []

    if (user) {
        const membership = await prisma.businessMember.findFirst({ where: { userId: user.id } })
        if (membership) {
            const biz = membership.businessId

            submissionsCount = await prisma.feedbackSubmission.count({ where: { businessId: biz } })
            generatedCount = await prisma.generatedReview.count({ where: { businessId: biz } })

            const avg = await prisma.feedbackSubmission.aggregate({
                _avg: { rating: true },
                where: { businessId: biz }
            })
            avgRating = avg._avg.rating || 0

            needsAttention = await prisma.feedbackSubmission.findMany({
                where: { businessId: biz, rating: { lte: 3 } },
                orderBy: { createdAt: 'desc' },
                take: 5,
                select: { id: true, rating: true, createdAt: true }
            })

            recentActivity = await prisma.feedbackSubmission.findMany({
                where: { businessId: biz },
                orderBy: { createdAt: 'desc' },
                take: 5,
                include: { reviews: true }
            })

            // Generate 30-day chronological array (padding empty days with 0)
            const today = new Date();
            chartData = Array.from({ length: 30 }).map((_, i) => {
                const d = subDays(today, 29 - i);
                return {
                    date: format(d, "MMM dd"),
                    rawDate: format(d, "yyyy-MM-dd"),
                    reviews: 0
                }
            });

            // Map actual database insights onto the padded array
            const pastReviews = await prisma.generatedReview.findMany({
                where: {
                    businessId: biz,
                    createdAt: { gte: subDays(today, 30) }
                },
                select: { createdAt: true }
            })

            pastReviews.forEach((gr: any) => {
                const day = format(new Date(gr.createdAt), "yyyy-MM-dd");
                const bucket = chartData.find(c => c.rawDate === day);
                if (bucket) bucket.reviews++;
            });
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
                <p className="text-muted-foreground">
                    Track your QR scans, review generations, and overall activity.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-100 fill-mode-both">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Review Sessions
                        </CardTitle>
                        <ScanFace className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{submissionsCount}</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 text-emerald-500 mt-1">
                            <ArrowUpRight className="h-3 w-3" />
                            Active Customer Clicks
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Reviews Generated
                        </CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{generatedCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            AI Output volume
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Avg Google Rating
                        </CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{avgRating.toFixed(1)}</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 text-emerald-500 mt-1">
                            <ArrowUpRight className="h-3 w-3" />
                            Based on customer feedback
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="col-span-full animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both">
                <CardHeader>
                    <CardTitle>AI Performance Trend</CardTitle>
                    <CardDescription>
                        Total reviews generated per day over the last 30 days.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <AnalyticsChart data={chartData} />
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>
                            A timeline of recent review interactions from customers.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentActivity.length > 0 ? (
                            <div className="space-y-4">
                                {recentActivity.map(item => (
                                    <div key={item.id} className="flex border-b pb-4 last:border-0 rounded-md">
                                        <div className="mr-4 mt-1 bg-emerald-500/10 p-2 rounded-full h-fit flex-shrink-0">
                                            <Star className="h-4 w-4 text-emerald-500 fill-emerald-500" />
                                        </div>
                                        <div className="w-full">
                                            <div className="flex justify-between items-center w-full">
                                                <p className="text-sm font-medium">Customer rated {item.rating} Stars</p>
                                                <span className="text-xs text-muted-foreground">{item.createdAt.toLocaleDateString()}</span>
                                            </div>
                                            {item.reviews && item.reviews.length > 0 && item.reviews[0].reviewText && item.rating >= 4 ? (
                                                <p className="text-xs text-muted-foreground mt-2 line-clamp-2 border-l-2 border-emerald-500 pl-2">
                                                    "{item.reviews[0].reviewText}"
                                                </p>
                                            ) : null}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex h-[250px] items-center justify-center rounded-md border border-dashed text-muted-foreground text-sm">
                                No activity recorded yet. Scan your QR code to test!
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Needs Attention</CardTitle>
                        <CardDescription>
                            Low rating feedback collected privately.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {needsAttention.length > 0 ? (
                            <div className="space-y-4">
                                {needsAttention.map(item => (
                                    <div key={item.id} className="flex items-center gap-4 border-b pb-4 last:border-0">
                                        <div className="bg-red-500/10 p-2 rounded-full">
                                            <AlertTriangle className="h-4 w-4 text-red-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-red-500">{item.rating} Star Private Feedback</p>
                                            <p className="text-xs text-muted-foreground">{item.createdAt.toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex h-[250px] items-center justify-center rounded-md border border-dashed text-muted-foreground text-sm text-center px-4">
                                Great job! No negative feedback recently.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
