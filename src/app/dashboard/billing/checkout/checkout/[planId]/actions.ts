"use server"

import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function createPaymentRequest(data: {
    planId: string,
    businessId: string,
    cycle: 'monthly' | 'yearly',
    amount: number,
    tax: number,
    total: number
}) {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return { error: 'Unauthorized: Please log in again.' }
    }

    try {
        // Generate an Order Number e.g., ORD-16982...
        const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`

        // Check for existing pending orders for this exact business + plan to prevent spamming orders
        const existingOrder = await prisma.order.findFirst({
            where: {
                businessId: data.businessId,
                status: 'PENDING'
            }
        })

        if (existingOrder) {
            // Cancel the previous pending order to maintain clean ledgers
            await prisma.order.update({
                where: { id: existingOrder.id },
                data: { status: 'CANCELLED' }
            })
        }

        // Standard transaction to execute both order generation & subscription initialization
        const result = await prisma.$transaction(async (tx) => {
            const order = await tx.order.create({
                data: {
                    orderNumber,
                    businessId: data.businessId,
                    planId: data.planId,
                    amount: data.amount,
                    tax: data.tax,
                    total: data.total,
                    billingCycle: data.cycle,
                    status: 'PENDING',
                    paymentMethod: 'WHATSAPP'
                }
            });

            // Is there an active subscription?
            let sub = await tx.subscription.findFirst({
                where: { businessId: data.businessId, status: { in: ['active', 'trialing'] } }
            })

            if (!sub) {
                // Determine next billing dates based on cycle
                const start = new Date();
                const end = new Date();
                if (data.cycle === 'monthly') {
                    end.setMonth(end.getMonth() + 1);
                } else {
                    end.setFullYear(end.getFullYear() + 1);
                }

                sub = await tx.subscription.create({
                    data: {
                        businessId: data.businessId,
                        planId: data.planId,
                        provider: 'MANUAL',
                        providerSubscriptionId: `SUB-${orderNumber}`,
                        status: 'PAYMENT_PENDING',
                        currentPeriodStart: start,
                        currentPeriodEnd: end
                    }
                })
            } else {
                // Upgrade scenario: mark their CURRENT subscription as waiting for manual payment / pending change
                // But normally we wait till Superadmin hits active. For this workflow lets create an order which the superadmin processes and then they overwrite the sub.
                await tx.subscription.update({
                    where: { id: sub.id },
                    data: {
                        status: 'PAYMENT_PENDING',
                    }
                })
            }

            return order;
        });

        return { success: true, orderNumber: result.orderNumber, orderId: result.id }

    } catch (e: any) {
        console.error("Payment request failed:", e);
        return { error: e.message || 'Failed to submit payment request' }
    }
}

export async function validateCoupon(code: string, planId: string, cycle: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    if (!code || code.trim() === '') return { error: 'Please enter a coupon code.' }

    try {
        const coupon = await prisma.coupon.findUnique({
            where: { code: code.trim().toUpperCase() }
        })

        if (!coupon) return { error: 'Invalid coupon code.' }
        if (coupon.status !== 'active') return { error: 'This coupon is no longer active.' }
        if (coupon.validFrom && new Date() < coupon.validFrom) return { error: 'Coupon is not valid yet.' }
        if (coupon.validUntil && new Date() > coupon.validUntil) return { error: 'This coupon has expired.' }
        if (coupon.maxRedemptions && coupon.usedRedemptions >= coupon.maxRedemptions) return { error: 'Coupon usage limit reached.' }

        const appliesTo = coupon.appliesTo as string[]
        if (!appliesTo.includes('all') && !appliesTo.includes(planId)) {
            return { error: 'Coupon does not apply to this plan.' }
        }

        if (coupon.billingCycle !== 'both' && coupon.billingCycle !== cycle) {
            return { error: `This coupon is only valid for ${coupon.billingCycle} subscriptions.` }
        }

        return {
            success: true,
            couponId: coupon.id,
            type: coupon.type,
            value: Number(coupon.value)
        }

    } catch (e: any) {
        return { error: 'Error validating coupon.' }
    }
}
