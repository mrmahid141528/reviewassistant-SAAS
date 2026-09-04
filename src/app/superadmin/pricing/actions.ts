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

export async function getTrialDuration() {
    const config = await prisma.platformSetting.findUnique({
        where: { key: "FREE_TRIAL_CONFIG" }
    });

    let duration = 7;
    if (config?.value) {
        const val = config.value as any;
        if (typeof val === "object" && val.durationDays !== undefined) {
            duration = Number(val.durationDays);
        }
    }
    return duration;
}

export async function updateTrialDuration(days: number, target: string) {
    await checkAdmin();

    // Fetch old config to know the current state before we override it
    const oldGlobalLimit = await getTrialDuration();

    await prisma.platformSetting.upsert({
        where: { key: "FREE_TRIAL_CONFIG" },
        update: { value: { durationDays: days } },
        create: {
            key: "FREE_TRIAL_CONFIG",
            value: { durationDays: days }
        }
    });

    // Process overriding logic based on the target setting
    const allBusinesses = await prisma.business.findMany({ select: { id: true, createdAt: true, settings: true, razorpayPlanId: true } });

    for (const b of allBusinesses) {
        let currentSettings = b.settings && typeof b.settings === 'object' ? { ...(b.settings as any) } : {};
        let needsUpdate = false;

        if (target === "all") {
            if ("freeTrialDays" in currentSettings) {
                delete currentSettings.freeTrialDays;
                needsUpdate = true;
            }
        } else if (target === "active") {
            const currentOverride = currentSettings.freeTrialDays;
            const limit = currentOverride !== undefined ? currentOverride : oldGlobalLimit;
            const daysSinceCreated = (Date.now() - b.createdAt.getTime()) / (1000 * 60 * 60 * 24);
            const isCurrentlyExpired = !b.razorpayPlanId && daysSinceCreated > limit;

            if (!isCurrentlyExpired) {
                // Explicitly lock in the new trial duration for currently eligible accounts
                currentSettings.freeTrialDays = days;
                needsUpdate = true;
            }
        } else if (target === "new") {
            // Lock in ALL existing businesses to their previous limit so they are unaffected by the new global change
            const currentOverride = currentSettings.freeTrialDays;
            if (currentOverride === undefined) {
                currentSettings.freeTrialDays = oldGlobalLimit;
                needsUpdate = true;
            }
        }

        if (needsUpdate) {
            await prisma.business.update({ where: { id: b.id }, data: { settings: currentSettings } });
        }
    }

    revalidatePath("/superadmin/pricing");
    return { success: true };
}
