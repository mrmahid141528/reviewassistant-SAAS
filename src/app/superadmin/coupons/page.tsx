import prisma from "@/lib/prisma"
import { Coupon } from "@prisma/client"
import { CouponsClient } from "./CouponsClient"

export const dynamic = 'force-dynamic'

export default async function CouponsPage() {
    // 1. Fetch Coupons
    const coupons = await prisma.coupon.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: { redemptions: true }
            }
        }
    })

    // 2. Aggregate metrics
    const activeCoupons = coupons.filter((c: Coupon) => c.status === 'active').length
    const totalRedemptions = coupons.reduce((acc: number, c: Coupon) => acc + c.usedRedemptions, 0)

    // Total discount given logic would require aggregating CouponRedemption
    // But since this is a stub we will calculate it roughly or leave 0 for now.
    const redemptions = await prisma.couponRedemption.aggregate({
        _sum: { discountAmount: true }
    })
    const discountGiven = Number(redemptions._sum.discountAmount || 0)

    const expiringSoon = coupons.filter((c: Coupon) => {
        if (!c.validUntil) return false
        const diff = new Date(c.validUntil).getTime() - new Date().getTime()
        return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000 // 7 days
    }).length

    const metrics = {
        activeCoupons,
        totalRedemptions,
        discountGiven,
        expiringSoon
    }

    // Convert Prisma models to plain objects before passing to client components
    const safeCoupons = coupons.map((c: Coupon) => ({
        ...c,
        value: Number(c.value),
        minPurchase: c.minPurchase ? Number(c.minPurchase) : null,
    }))

    const dbPlans = await prisma.plan.findMany({
        select: { id: true, name: true, priceMonthly: true, priceYearly: true }
    })

    const plans = dbPlans.map(p => ({
        id: p.id,
        name: p.name,
        priceMonthly: Number(p.priceMonthly),
        priceYearly: Number(p.priceYearly)
    }))

    return (
        <CouponsClient
            initialCoupons={safeCoupons}
            metrics={metrics}
            plans={plans}
        />
    )
}
