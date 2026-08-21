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

export default async function DashboardOverviewPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let submissionsCount = 0
    let generatedCount = 0
    let avgRating = 0
    let needsAttention: { id: string, rating: number, createdAt: Date }[] = []

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
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
                <p className="text-muted-foreground">
                    Track your QR scans, review generations, and overall activity.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>
                            A timeline of recent review interactions from customers.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {submissionsCount > 0 ? (
                            <div className="flex h-[250px] items-center justify-center rounded-md border border-dashed text-muted-foreground text-sm flex-col gap-2">
                                <MessageSquare className="h-8 w-8 text-emerald-500/50" />
                                Monitoring active incoming reviews perfectly...
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
