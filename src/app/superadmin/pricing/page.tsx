import prisma from "@/lib/prisma"
import { getPlans, getTrialDuration } from "./actions"
import { PricingClient } from "./PricingClient"

export const dynamic = 'force-dynamic'

export default async function PricingServerPage() {
    // 1. Fetch Plans and Subs Count using the action
    const plans = await getPlans()

    // 2. Fetch Trial Duration
    const trialDuration = await getTrialDuration()

    // 3. Intelligence Stats
    const totalPlans = await prisma.plan.count()

    const activeSubsCount = await prisma.subscription.count({
        where: { status: 'active' }
    })

    const activeSubscriptions = await prisma.subscription.findMany({
        where: { status: 'active' },
        include: { plan: true }
    })

    const mrr = activeSubscriptions.reduce((acc, sub) => acc + Number(sub.plan?.priceMonthly || 0), 0)

    const totalSubs = activeSubsCount

    // Find custom popular plan based on manual assignment
    const subCounts: Record<string, number> = {}

    for (const sub of activeSubscriptions) {
        if (sub.plan) subCounts[sub.plan.name] = (subCounts[sub.plan.name] || 0) + 1
    }

    let popularPlan = "None"
    let max = 0
    for (const [name, count] of Object.entries(subCounts)) {
        if (count > max) {
            max = count
            popularPlan = name
        }
    }

    if (popularPlan === "None" && plans.length > 0) {
        // Default visualization if no subs
        const gPlan = plans.find((p: any) => p.slug === 'growth') || plans[0]
        popularPlan = gPlan.name
    }

    const stats = {
        totalPlans,
        activeSubs: totalSubs,
        mrr,
        popularPlan
    }

    return <PricingClient plans={plans} stats={stats} trialDuration={trialDuration} />
}
