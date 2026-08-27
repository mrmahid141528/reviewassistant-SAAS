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
            locations={locations}
            maxLocations={maxLocations}
            currentCount={activeLocationsCount}
            businessSlug={membership.business.slug}
        />
    );
}
