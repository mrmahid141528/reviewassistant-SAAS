import React from 'react';
import { createClient } from "@/lib/supabase/server";
import { redirect } from 'next/navigation';
import prisma from "@/lib/prisma";
import { MainAnalyticsClient } from './AnalyticsClient';
import { format, subDays, differenceInDays, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';

export default async function AnalyticsPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const searchParams = await props.searchParams;
    const range = searchParams?.range as string | undefined || '30d';
    const fromStr = searchParams?.from as string | undefined;
    const toStr = searchParams?.to as string | undefined;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const membership = await prisma.businessMember.findFirst({
        where: { userId: user.id },
        include: { business: true }
    });

    if (!membership?.businessId) {
        redirect('/dashboard');
    }

    const bizId = membership.businessId;

    // Determine Date Bounds
    const today = new Date();
    let startDate = subDays(today, 29); // default 30 days
    let endDate = today;

    if (range === '7d') {
        startDate = subDays(today, 6);
    } else if (range === 'year') {
        startDate = subDays(today, 364);
    } else if (range === 'custom' && fromStr && toStr) {
        startDate = new Date(fromStr);
        endDate = new Date(toStr);
    }

    startDate = startOfDay(startDate);
    endDate = endOfDay(endDate);

    // Fetch deep analytics data
    const feedbacks = await prisma.feedbackSubmission.findMany({
        where: {
            businessId: bizId,
            createdAt: { gte: startDate, lte: endDate }
        },
        orderBy: { createdAt: 'desc' },
        include: {
            reviews: true,
            campaign: {
                include: {
                    location: true
                }
            }
        }
    });

    // Formatting raw data for the client
    const rawFeedbacks = feedbacks.map(f => ({
        id: f.id,
        rating: f.rating,
        date: format(new Date(f.createdAt), 'MMM dd, yyyy HH:mm'),
        rawDate: f.createdAt.toISOString(),
        location: f.campaign?.location?.name || 'Main Location',
        hasGenerated: (f.reviews && f.reviews.length > 0)
    }));

    // Generate timeseries
    let daysToLookBack = differenceInDays(endDate, startDate) + 1;
    if (daysToLookBack <= 0 || isNaN(daysToLookBack)) daysToLookBack = 30; // Fail-safe

    // Cap at 365 to prevent extreme memory overload traversing thousands of blank days
    if (daysToLookBack > 365) daysToLookBack = 365;

    const tsData = Array.from({ length: daysToLookBack }).map((_, i) => {
        const d = subDays(endDate, (daysToLookBack - 1) - i);
        return {
            date: format(d, daysToLookBack > 31 ? "MMM yyyy" : "MMM dd"),
            rawDate: format(d, "yyyy-MM-dd"),
            sessions: 0,
            generated: 0
        };
    });

    feedbacks.forEach(f => {
        const day = format(new Date(f.createdAt), "yyyy-MM-dd");
        // if large range, bucket might map to same date format depending on above but finding exact rawDate works
        const bucket = tsData.find(c => c.rawDate === day);
        if (bucket) {
            bucket.sessions++;
            if (f.reviews && f.reviews.length > 0) {
                bucket.generated++;
            }
        } else if (daysToLookBack > 31) {
            // Fuzzy match for month aggregation if we do 'MMM yyyy' logic
            // Since we rawDate maps exactly to a day, we might have 365 buckets!
            // It's perfectly fine to have 365 points for Recharts.
            const roughBucket = tsData.find(c => c.rawDate === day);
            if (roughBucket) {
                roughBucket.sessions++;
                if (f.reviews && f.reviews.length > 0) roughBucket.generated++;
            }
        }
    });

    // To prevent extremely dense bar charts, we might want to aggregate by month if > 90 days
    // But for now, returning exact day counts up to 365 is completely native constraint capacity for Recharts.

    return (
        <MainAnalyticsClient
            timeseries={tsData}
            recentFeedbacks={rawFeedbacks}
            overallRating={
                feedbacks.length > 0
                    ? (feedbacks.reduce((a, b) => a + b.rating, 0) / feedbacks.length).toFixed(1)
                    : "0.0"
            }
            totalFeedbacks={feedbacks.length}
        />
    )
}
