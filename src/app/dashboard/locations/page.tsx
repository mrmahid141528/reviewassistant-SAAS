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

    const locations = await prisma.businessLocation.findMany({
        where: { businessId: membership.businessId },
        orderBy: { createdAt: 'desc' }
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

    return <LocationsClient
        locations={locations}
        maxLocations={maxLocations}
        currentCount={locations.length}
        businessSlug={membership.business.slug}
    />;
}
