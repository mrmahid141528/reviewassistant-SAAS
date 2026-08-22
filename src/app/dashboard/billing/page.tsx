import prisma from "@/lib/prisma"
import BillingClient from "./BillingClient"
import { createClient } from "@/lib/supabase/server"

export default async function BillingPage() {
    const plans = await prisma.plan.findMany({
        where: { status: 'active' },
        orderBy: { priceMonthly: 'asc' }
    });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let activePlanId = null;
    let isExpired = false;
    let daysSinceCreated = 0;

    if (user) {
        const membership = await prisma.businessMember.findFirst({
            where: { userId: user.id },
            include: { business: true }
        });
        if (membership) {
            activePlanId = membership.business.razorpayPlanId;
            daysSinceCreated = Math.floor((Date.now() - membership.business.createdAt.getTime()) / (1000 * 60 * 60 * 24));
            if (!activePlanId && daysSinceCreated > 7) {
                isExpired = true;
            }
        }
    }

    return <BillingClient plans={plans} activePlanId={activePlanId} daysSinceCreated={daysSinceCreated} isExpired={isExpired} />
}
