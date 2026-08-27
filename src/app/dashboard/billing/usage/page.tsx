import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import UsageClient from "./UsageClient"

export default async function UsagePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const membership = await prisma.businessMember.findFirst({
        where: { userId: user.id },
        include: { business: true }
    });

    if (!membership) redirect("/dashboard");

    const subscription = await prisma.subscription.findFirst({
        where: { businessId: membership.businessId, status: "active" },
        include: { plan: true },
        orderBy: { currentPeriodEnd: 'desc' }
    });

    const locationCount = await prisma.businessLocation.count({
        where: { businessId: membership.businessId, status: 'active' }
    });

    const teamCount = await prisma.businessMember.count({
        where: { businessId: membership.businessId }
    });

    const reviewCount = await prisma.generatedReview.count({
        where: { businessId: membership.businessId }
    });

    const serializedSubscription = subscription ? JSON.parse(JSON.stringify(subscription)) : null;

    return (
        <UsageClient
            subscription={serializedSubscription as any}
            usage={{ locations: locationCount, teams: teamCount, reviews: reviewCount }}
        />
    )
}
