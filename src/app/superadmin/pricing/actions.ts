"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

const SUPER_ADMIN = "mrmahid141528@gmail.com"

async function checkAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email?.toLowerCase() !== SUPER_ADMIN) throw new Error("Unauthorized")
}

export async function getPlans() {
    await checkAdmin();
    const plans = await prisma.plan.findMany({
        orderBy: { priceMonthly: 'asc' },
        include: {
            _count: {
                select: { subscriptions: { where: { status: 'active' } } }
            }
        }
    });
    return JSON.parse(JSON.stringify(plans));
}

export async function updatePlan(id: string, payload: any) {
    await checkAdmin();

    await prisma.plan.update({
        where: { id },
        data: {
            name: payload.name,
            description: payload.description,
            priceMonthly: payload.priceMonthly,
            priceYearly: payload.priceYearly,
            currency: payload.currency || "INR",
            features: payload.features,
            limits: payload.limits,
            status: payload.status || "active"
        }
    });

    revalidatePath("/superadmin/pricing");
    revalidatePath("/dashboard/billing");
    return { success: true };
}

export async function archivePlan(id: string) {
    await checkAdmin();
    await prisma.plan.update({
        where: { id },
        data: { status: 'archived' }
    });
    revalidatePath("/superadmin/pricing");
    return { success: true };
}

export async function seedPlans() {
    await checkAdmin();

    const count = await prisma.plan.count();
    if (count > 0) return { success: false, msg: "Plans already exist" };

    const initialPlans = [
        {
            name: "Starter",
            slug: "starter",
            description: "Perfect for single locations starting out.",
            priceMonthly: 799.00,
            priceYearly: 7990.00,
            features: ["1 Business Location", "50 AI Reviews/month", "Standard Branding", "Basic Analytics"],
            limits: { maxLocations: 1, maxGenerations: 50, hasWatermark: true }
        },
        {
            name: "Growth",
            slug: "growth",
            description: "Our most popular tier for active businesses.",
            priceMonthly: 1499.00,
            priceYearly: 14990.00,
            features: ["1 Business Location", "Unlimited AI Reviews", "No Watermark", "Custom Feedback Filtering", "Advanced Analytics"],
            limits: { maxLocations: 1, maxGenerations: -1, hasWatermark: false }
        },
        {
            name: "Business",
            slug: "business",
            description: "For expanding brands and franchises.",
            priceMonthly: 3999.00,
            priceYearly: 39990.00,
            features: ["Up to 5 Locations", "Staff Accounts", "CSV Bulk Export", "Automated Pipelines"],
            limits: { maxLocations: 5, maxGenerations: -1, hasWatermark: false }
        },
        {
            name: "Enterprise",
            slug: "enterprise",
            description: "For digital marketing agencies.",
            priceMonthly: 9999.00,
            priceYearly: 99990.00,
            features: ["Custom Location Limits", "Custom AI Review Limits", "Whitelabel Dashboard", "API Access (Future)"],
            limits: { maxLocations: 999, maxGenerations: -1, hasWatermark: false, customPlan: true }
        }
    ]

    for (const plan of initialPlans) {
        await prisma.plan.create({ data: plan })
    }

    revalidatePath("/superadmin/pricing");
    return { success: true };
}
