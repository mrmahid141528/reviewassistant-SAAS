import prisma from "@/lib/prisma"
import { getPlans } from "./actions"
import { PricingClient } from "./PricingClient"

export const dynamic = 'force-dynamic'

export default async function PricingServerPage() {
    // 1. Fetch Plans and Subs Count using the action
    const plans = await getPlans()

    // 2. Intelligence Stats
    const totalPlans = await prisma.plan.count()

    const activeSubsCount = await prisma.subscription.count({
        where: { status: 'active' }
    })

    const activeSubscriptions = await prisma.subscription.findMany({
        where: { status: 'active' },
        include: { plan: true }
    })

    const mrr = activeSubscriptions.reduce((acc, sub) => acc + Number(sub.plan?.priceMonthly || 0), 0)

    const allPlans = await prisma.plan.findMany()
    const planMap = new Map(allPlans.map(p => [p.id, Number(p.priceMonthly || 0)]))
    const planNameMap = new Map(allPlans.map(p => [p.id, p.name]))

    const totalSubs = activeSubsCount

    // Find custom popular plan based on manual assignment
    const subCounts: Record<string, number> = {}

    // Add default subscriptions logic if necessary
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

    return <PricingClient plans={plans} stats={stats} />
}
