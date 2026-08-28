import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import LocationsClient from "./LocationsClient"

export default async function LocationsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect("/login")

    const membership = await prisma.businessMember.findFirst({
        where: { userId: user.id },
        include: { business: true }
    })

    if (!membership) redirect("/onboarding")

    let locations = await prisma.businessLocation.findMany({
        where: { businessId: membership.businessId },
        orderBy: [
            { isMain: 'desc' },
            { createdAt: 'desc' }
        ]
    });

    // Retroactive Default Location Fallback for users who created accounts before the Multi-Location architecture
    if (locations.length === 0) {
        const fallBackLocation = await prisma.businessLocation.create({
            data: {
                businessId: membership.businessId,
                name: 'Main Location',
                phone: membership.business.phone,
                country: 'India',
                isMain: true,
                status: 'active'
            }
        });
        locations = [fallBackLocation];
    }

    const activeLocationsCount = locations.filter(loc => loc.status === 'active').length;

    // Fetch metrics for all locations in this business
    const submissions = await prisma.feedbackSubmission.findMany({
        where: { businessId: membership.businessId },
        select: {
            rating: true,
            campaign: { select: { locationId: true } },
            _count: { select: { reviews: true } }
        }
    });

    // Calculate metrics per location
    const locationStats: Record<string, { ratingSum: number, scans: number, reviews: number }> = {};

    // Also track fallback metrics for "All Locations" / Location-Agnostic Campaigns
    let mainLocStats = { ratingSum: 0, scans: 0, reviews: 0 };

    submissions.forEach(sub => {
        const locId = sub.campaign?.locationId;
        const targetStat = locId ? (locationStats[locId] = locationStats[locId] || { ratingSum: 0, scans: 0, reviews: 0 }) : mainLocStats;

        targetStat.ratingSum += sub.rating;
        targetStat.scans += 1;
        targetStat.reviews += sub._count.reviews;
    });

    const locationsWithMetrics = locations.map(loc => {
        // If it's the main location, we also add the stats from location-agnostic campaigns to it (null locationId)
        let stats = locationStats[loc.id] || { ratingSum: 0, scans: 0, reviews: 0 };

        if (loc.isMain) {
            stats = {
                ratingSum: stats.ratingSum + mainLocStats.ratingSum,
                scans: stats.scans + mainLocStats.scans,
                reviews: stats.reviews + mainLocStats.reviews
            };
        }

        const avgRating = stats.scans > 0 ? (stats.ratingSum / stats.scans).toFixed(1) : "0.0";

        return {
            ...loc,
            rating: avgRating,
            scans: stats.scans,
            reviews: stats.reviews
        };
    });

    let maxLocations = 1;
    if (membership.business.razorpayPlanId) {
        const activePlan = await prisma.plan.findUnique({
            where: { id: membership.business.razorpayPlanId }
        });

        if (activePlan?.limits) {
            const limits = activePlan.limits as { maxLocations?: number };
            maxLocations = limits.maxLocations ?? 1;
        }
    } else {
        const trialDays = (Date.now() - membership.business.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        if (trialDays > 7) maxLocations = 0; // Frozen
    }

    return (
        <LocationsClient
            locations={locationsWithMetrics}
            maxLocations={maxLocations}
            currentCount={activeLocationsCount}
            businessSlug={membership.business.slug}
        />
    );
}
