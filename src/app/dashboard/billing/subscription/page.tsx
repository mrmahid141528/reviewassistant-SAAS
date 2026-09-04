import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import SubscriptionClient from "./SubscriptionClient"
import { getTrialDuration } from "@/app/superadmin/pricing/actions";

export default async function SubscriptionPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const membership = await prisma.businessMember.findFirst({
        where: { userId: user.id },
        include: { business: true }
    });

    if (!membership) redirect("/dashboard");

    const latestSubscription = await prisma.subscription.findFirst({
        where: { businessId: membership.businessId },
        include: { plan: true },
        orderBy: { currentPeriodEnd: 'desc' }
    });

    const isActiveRow = latestSubscription?.status === "active";
    const daysSinceCreated = (Date.now() - membership.business.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    let trialLimit = await getTrialDuration();
    const bSettings = membership.business.settings as any;
    if (bSettings && typeof bSettings === 'object' && typeof bSettings.freeTrialDays === 'number') {
        trialLimit = bSettings.freeTrialDays;
    }

    let isExpired = false;
    if (!isActiveRow && daysSinceCreated > trialLimit) {
        isExpired = true;
    }

    const hasPreviousPaid = !!latestSubscription; // If they ever had any subscription record, we assume they had a paid sub.
    const activeSubscription = isActiveRow ? latestSubscription : null;

    const serializedSubscription = activeSubscription ? JSON.parse(JSON.stringify(activeSubscription)) : null;

    return (
        <SubscriptionClient
            subscription={serializedSubscription as any}
            isExpired={isExpired}
            daysSinceCreated={daysSinceCreated}
            hasPreviousPaid={hasPreviousPaid}
            trialLimit={trialLimit}
        />
    )
}
