import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { subDays, format, differenceInDays, startOfDay, endOfDay } from "date-fns"

import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { OnboardingProgressTracker } from "@/components/dashboard/OnboardingProgressTracker"
import { KPIGrid } from "@/components/dashboard/KPIGrid"
import { ReviewFunnel } from "@/components/dashboard/ReviewFunnel"
import { QuickQRCard } from "@/components/dashboard/QuickQRCard"
import { RecentActivity, CustomerFeedback } from "@/components/dashboard/ActivityAndFeedback"
import { AnalyticsChart } from "@/components/dashboard/AnalyticsChart"
import { DashboardDateFilter } from "@/components/dashboard/DashboardDateFilter"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default async function DashboardOverviewPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const searchParams = await props.searchParams;
    const locationIdFilter = searchParams?.locationId as string | undefined;
    const rangeFilter = searchParams?.range as string | undefined || '30d';
    const fromStr = searchParams?.from as string | undefined;
    const toStr = searchParams?.to as string | undefined;

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const userName = user?.user_metadata?.full_name || 'Owner'
    let businessName = "Your Business"
    let businessObj: any = null;
    let dbUser: any = null;
    let locations: { id: string, name: string }[] = []

    // Core Metrics
    let submissionsCount = 0
    let generatedCount = 0
    let avgRating = 0
    let isSetupComplete = false;

    // Derived Funnel metrics (Mocked for V1 where missing)
    let qrScans = 0;
    let googleClicks = 0;

    let feedbacks: any[] = []
    let activities: any[] = []
    let chartData: { date: string, rawDate: string, reviews: number, scans: number }[] = []

    if (user) {
        dbUser = await prisma.user.findUnique({ where: { id: user.id } });

        const membership = await prisma.businessMember.findFirst({
            where: { userId: user.id },
            include: { business: true }
        })
        if (membership) {
            const bizId = membership.businessId
            businessObj = membership.business
            businessName = membership.business.name || businessName
            isSetupComplete = !!membership.business.name // Simple generic check for now

            locations = await prisma.businessLocation.findMany({
                where: { businessId: bizId },
                select: { id: true, name: true }
            })

            // Determine Date Bounds
            const today = new Date();
            let startDate = subDays(today, 29); // default 30 days
            let endDate = today;

            if (rangeFilter === '7d') startDate = subDays(today, 6);
            else if (rangeFilter === 'year') startDate = subDays(today, 364);
            else if (rangeFilter === 'custom' && fromStr && toStr) {
                startDate = new Date(fromStr);
                endDate = new Date(toStr);
            }

            startDate = startOfDay(startDate);
            endDate = endOfDay(endDate);

            // Filter context injection
            const queryContext: any = {
                businessId: bizId,
                createdAt: { gte: startDate, lte: endDate }
            };
            const genQueryContext: any = {
                businessId: bizId,
                createdAt: { gte: startDate, lte: endDate }
            };

            if (locationIdFilter && locationIdFilter !== 'all') {
                const linkedCampaigns = await prisma.campaign.findMany({ where: { locationId: locationIdFilter }, select: { id: true } });
                const campIds = linkedCampaigns.map(c => c.id);
                queryContext.campaignId = { in: campIds };
                genQueryContext.submission = { campaignId: { in: campIds } };
            }

            submissionsCount = await prisma.feedbackSubmission.count({ where: queryContext })
            generatedCount = await prisma.generatedReview.count({ where: genQueryContext })

            const avg = await prisma.feedbackSubmission.aggregate({
                _avg: { rating: true },
                where: queryContext
            })
            avgRating = avg._avg.rating || 0

            qrScans = submissionsCount; // 1 to 1 mapping with sessions without dedicated tracker
            googleClicks = generatedCount; // No drop-off mocking, exact generation count

            const rawDbFeedbacks = await prisma.feedbackSubmission.findMany({
                where: queryContext,
                orderBy: { createdAt: 'desc' },
                take: 5,
                include: { reviews: true }
            })

            feedbacks = rawDbFeedbacks.map(f => ({
                rating: f.rating,
                text: f.reviews?.[0]?.reviewText || 'No comment provided.',
                timeLabel: format(new Date(f.createdAt), 'MMM dd')
            }))

            activities = []
            rawDbFeedbacks.slice(0, 3).forEach(f => {
                activities.push({ type: 'session', timeLabel: format(new Date(f.createdAt), 'MMM dd') });
                if (f.reviews?.length > 0) {
                    activities.push({ type: 'generated', timeLabel: format(new Date(f.createdAt), 'MMM dd') });
                }
            })

            // Generate chronological timeseries map
            let daysToLookBack = differenceInDays(endDate, startDate) + 1;
            if (daysToLookBack <= 0 || isNaN(daysToLookBack)) daysToLookBack = 30;
            if (daysToLookBack > 365) daysToLookBack = 365;

            chartData = Array.from({ length: daysToLookBack }).map((_, i) => {
                const d = subDays(endDate, (daysToLookBack - 1) - i);
                return {
                    date: format(d, daysToLookBack > 31 ? "MMM yyyy" : "MMM dd"),
                    rawDate: format(d, "yyyy-MM-dd"),
                    scans: 0,
                    reviews: 0
                }
            });

            // Map the raw feedback submissions directly to timeseries since they track sessions/scans over time
            const pastFeedbacks = await prisma.feedbackSubmission.findMany({
                where: queryContext,
                select: { createdAt: true, reviews: { select: { id: true } } }
            })

            pastFeedbacks.forEach((f: any) => {
                const day = format(new Date(f.createdAt), "yyyy-MM-dd");
                const bucket = chartData.find(c => c.rawDate === day);
                if (bucket) {
                    bucket.scans++;
                    if (f.reviews && f.reviews.length > 0) bucket.reviews++;
                }
            });
        }
    }

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-10">

            <DashboardHeader userName={userName} locations={locations} />
            <OnboardingProgressTracker business={businessObj || {}} dbUser={dbUser || {}} />

            <KPIGrid metrics={{
                scans: qrScans,
                sessions: submissionsCount,
                generated: generatedCount,
                rating: avgRating,
                totalReviews: submissionsCount // Using sessions as total reviews for now
            }} />

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-7 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">

                <Card className="col-span-1 lg:col-span-7 shadow-sm">
                    <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 pb-2">
                        <div>
                            <CardTitle className="text-lg">Review Activity</CardTitle>
                            <CardDescription>Customer activity across your review flow.</CardDescription>
                        </div>
                        <DashboardDateFilter />
                    </CardHeader>
                    <CardContent className="pt-4">
                        <AnalyticsChart data={chartData} />
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both">
                <div className="col-span-1 lg:col-span-2">
                    <ReviewFunnel
                        scans={qrScans}
                        sessions={submissionsCount}
                        feedbacks={Math.round(submissionsCount * 0.9)}
                        generated={generatedCount}
                        googleClicks={googleClicks}
                    />
                </div>
                <div className="col-span-1 lg:col-span-2">
                    <RecentActivity activities={activities} />
                </div>
                <div className="col-span-1 lg:col-span-2">
                    <CustomerFeedback feedbacks={feedbacks} />
                </div>
            </div>

        </div>
    );
}
