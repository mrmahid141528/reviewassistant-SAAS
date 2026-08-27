import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import SubscriptionClient from "./SubscriptionClient"

export default async function SubscriptionPage() {
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

    const activePlanId = subscription?.planId || null;
    const daysSinceCreated = Math.floor((Date.now() - membership.business.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    let isExpired = false;

    if (!activePlanId && daysSinceCreated > 7) {
        isExpired = true;
    }

    const serializedSubscription = subscription ? JSON.parse(JSON.stringify(subscription)) : null;

    return (
        <SubscriptionClient
            subscription={serializedSubscription as any}
            isExpired={isExpired}
            daysSinceCreated={daysSinceCreated}
        />
    )
}
