"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const couponSchema = z.object({
    code: z.string().min(3),
    type: z.enum(['percentage', 'fixed']),
    value: z.number().positive(),
    appliesTo: z.array(z.string()).min(1),
    billingCycle: z.enum(['monthly', 'yearly', 'both']),
    maxRedemptions: z.number().nullable(),
    perCustomer: z.number().min(1),
    validFrom: z.date(),
    validUntil: z.date().nullable(),
    minPurchase: z.number().nullable(),
    duration: z.enum(['first_payment', 'first_n_months', 'forever']),
    durationInMonths: z.number().nullable()
})

export async function createCoupon(data: z.infer<typeof couponSchema>) {
    try {
        const validated = couponSchema.parse(data)

        await prisma.coupon.create({
            data: {
                code: validated.code.toUpperCase(),
                type: validated.type,
                value: validated.value,
                appliesTo: validated.appliesTo,
                billingCycle: validated.billingCycle,
                maxRedemptions: validated.maxRedemptions,
                perCustomer: validated.perCustomer,
                validFrom: validated.validFrom,
                validUntil: validated.validUntil,
                minPurchase: validated.minPurchase,
                duration: validated.duration,
                durationInMonths: validated.durationInMonths,
                status: 'active'
            }
        })

        revalidatePath('/superadmin/coupons', 'layout')
        return { success: true }
    } catch (e: any) {
        return { error: e.message }
    }
}

export async function toggleCoupon(id: string) {
    try {
        const coupon = await prisma.coupon.findUnique({ where: { id } })
        if (!coupon) throw new Error("Coupon not found")
        await prisma.coupon.update({
            where: { id },
            data: { status: coupon.status === 'active' ? 'disabled' : 'active' }
        })
        revalidatePath('/superadmin/coupons', 'layout')
        return { success: true }
    } catch (e: any) {
        return { error: e.message }
    }
}

export async function deleteCoupon(id: string) {
    try {
        await prisma.coupon.delete({ where: { id } })
        revalidatePath('/superadmin/coupons', 'layout')
        return { success: true }
    } catch (e: any) {
        return { error: e.message }
    }
}

export async function updateGlobalAnnualDiscount(percentage: number) {
    try {
        const plans = await prisma.plan.findMany();

        for (const plan of plans) {
            const monthly = Number(plan.priceMonthly);
            let newYearly = (monthly * 12) * (1 - (percentage / 100));
            // Ensure no negative values and round to nearest whole number to avoid decimals
            newYearly = Math.max(0, Math.round(newYearly));

            await prisma.plan.update({
                where: { id: plan.id },
                data: { priceYearly: newYearly }
            });
        }

        revalidatePath('/superadmin/coupons', 'layout');
        revalidatePath('/superadmin/pricing', 'layout');
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}
