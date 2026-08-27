import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import PlansClient from "./PlansClient"

export default async function PlansPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const membership = await prisma.businessMember.findFirst({
        where: { userId: user.id },
        include: { business: true }
    });

    if (!membership) redirect("/dashboard");

    const rawPlans = await prisma.plan.findMany({
        where: { status: 'active' },
        orderBy: { priceMonthly: 'asc' }
    });

    const activeSubscription = await prisma.subscription.findFirst({
        where: { businessId: membership.businessId, status: "active" },
        orderBy: { createdAt: 'desc' }
    });

    const plans = rawPlans.map(plan => ({
        ...plan,
        priceMonthly: Number(plan.priceMonthly),
        priceYearly: Number(plan.priceYearly)
    }));

    const locationCount = await prisma.businessLocation.count({
        where: { businessId: membership.businessId, status: 'active' }
    });

    return (
        <PlansClient
            plans={plans}
            activePlanId={activeSubscription?.planId || null}
            currentLocationCount={locationCount}
        />
    )
}
