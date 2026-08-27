"use server"

import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function addBusinessLocation(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    const membership = await prisma.businessMember.findFirst({
        where: { userId: user.id },
        include: { business: true }
    })

    if (!membership) throw new Error("No Business mapped")

    const name = formData.get("name") as string
    const phone = formData.get("phone") as string
    const address = formData.get("address") as string
    const city = formData.get("city") as string
    const state = formData.get("state") as string
    const postalCode = formData.get("postalCode") as string
    const country = formData.get("country") as string
    const reviewLink = formData.get("reviewLink") as string

    // [ENFORCEMENT GATE] Evaluate Active Plan Multi-Location Limits
    let maxLocations = 1;

    if (membership.business.razorpayPlanId) {
        const activePlan = await prisma.plan.findUnique({
            where: { id: membership.business.razorpayPlanId }
        });

        if (activePlan?.limits) {
            const limits = activePlan.limits as { maxLocations?: number };
            maxLocations = limits.maxLocations ?? 1;
        }
    } else {
        // Evaluate Trial
        const trialDays = (Date.now() - membership.business.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        if (trialDays > 7) {
            throw new Error("Your trial has expired. Subscribe to add locations.");
        }
    }

    const currentActiveLocationsCount = await prisma.businessLocation.count({
        where: { businessId: membership.businessId, status: 'active' }
    });

    if (currentActiveLocationsCount >= maxLocations) {
        throw new Error(`Limit Exceeded: Your active plan allows up to ${maxLocations} location${maxLocations > 1 ? 's' : ''}. Please upgrade your subscription to add more.`);
    }

    const isFirstLocation = await prisma.businessLocation.count({
        where: { businessId: membership.businessId }
    }) === 0;

    await prisma.businessLocation.create({
        data: {
            businessId: membership.businessId,
            name,
            phone,
            address,
            city,
            state,
            postalCode,
            country,
            reviewLink,
            status: 'active',
            isMain: isFirstLocation // Automatically set as main if it's the very first location created
        }
    });

    revalidatePath("/dashboard/locations");
    return { success: true };
}

export async function deleteBusinessLocation(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const membership = await prisma.businessMember.findFirst({
        where: { userId: user.id }
    })
    if (!membership) throw new Error("Unauthorized")

    const location = await prisma.businessLocation.findUnique({ where: { id } });
    if (!location || location.businessId !== membership.businessId) {
        throw new Error("Unauthorized or not found");
    }

    if (location.isMain) {
        throw new Error("Cannot delete the Main Location. Please set another location as Main first.");
    }

    await prisma.businessLocation.delete({
        where: { id }
    })

    revalidatePath("/dashboard/locations");
    return { success: true };
}

export async function setMainLocation(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const membership = await prisma.businessMember.findFirst({
        where: { userId: user.id }
    })
    if (!membership) throw new Error("Unauthorized")

    const location = await prisma.businessLocation.findUnique({ where: { id } });
    if (!location || location.businessId !== membership.businessId) {
        throw new Error("Unauthorized or not found");
    }

    // Unset all existing main flags
    await prisma.businessLocation.updateMany({
        where: { businessId: membership.businessId, isMain: true },
        data: { isMain: false }
    });

    // Set new main
    await prisma.businessLocation.update({
        where: { id },
        data: { isMain: true, status: 'active' } // main must be active
    });

    revalidatePath("/dashboard/locations");
    return { success: true };
}

export async function toggleLocationStatus(id: string, currentStatus: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const membership = await prisma.businessMember.findFirst({
        where: { userId: user.id }
    })
    if (!membership) throw new Error("Unauthorized")

    const location = await prisma.businessLocation.findUnique({ where: { id } });
    if (!location || location.businessId !== membership.businessId) {
        throw new Error("Unauthorized or not found");
    }

    if (location.isMain && currentStatus === 'active') {
        throw new Error("Cannot deactivate the Main Location.");
    }

    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

    // If we're activating, need to make sure we haven't hit the limit
    if (newStatus === 'active') {
        // Evaluate Plan Limits
        let maxLocations = 1;

        let business = null;
        if (membership.businessId) {
            business = await prisma.business.findUnique({ where: { id: membership.businessId } });
        }

        if (business?.razorpayPlanId) {
            const activePlan = await prisma.plan.findUnique({
                where: { id: business.razorpayPlanId }
            });

            if (activePlan?.limits) {
                const limits = activePlan.limits as { maxLocations?: number };
                maxLocations = limits.maxLocations ?? 1;
            }
        }

        const currentActiveLocationsCount = await prisma.businessLocation.count({
            where: { businessId: membership.businessId, status: 'active' }
        });

        if (currentActiveLocationsCount >= maxLocations) {
            throw new Error(`Limit Exceeded: You already have ${maxLocations} active locations.`);
        }
    }

    await prisma.businessLocation.update({
        where: { id },
        data: { status: newStatus }
    });

    revalidatePath("/dashboard/locations");
    return { success: true };
}
