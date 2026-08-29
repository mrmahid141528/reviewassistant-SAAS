"use server"

import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function forceActivateFreeTrialSync(planId: string) {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) return { error: 'Unauthorized' }

    try {
        const membership = await prisma.businessMember.findFirst({
            where: { userId: user.id }
        })
        if (!membership) return { error: 'Business not found' }

        const sub = await prisma.subscription.findFirst({
            where: { businessId: membership.businessId, status: { in: ['active', 'trialing'] } }
        })

        if (sub) {
            await prisma.subscription.update({
                where: { id: sub.id },
                data: { planId, status: 'active' } // Swapping to a free plan is instant
            })
        } else {
            const start = new Date()
            const end = new Date()
            end.setDate(end.getDate() + 14) // 14 Day trial

            await prisma.subscription.create({
                data: {
                    businessId: membership.businessId,
                    planId,
                    provider: 'FREE_TRIAL',
                    providerSubscriptionId: `TRIAL-${Date.now()}`,
                    status: 'trialing',
                    currentPeriodStart: start,
                    currentPeriodEnd: end
                }
            })
        }
        return { success: true }
    } catch (e: any) {
        return { error: e.message || "Failed to activate zero-cost plan." }
    }
}
