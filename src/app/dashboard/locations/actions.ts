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
    const address = formData.get("address") as string
    const googlePlaceId = formData.get("googlePlaceId") as string

    // [ENFORCEMENT GATE] Evaluate Active Plan Multi-Location Limits
    let maxLocations = 1; // Fallback starter limit

    if (membership.business.razorpayPlanId) {
        const activePlan = await prisma.plan.findUnique({
            where: { id: membership.business.razorpayPlanId }
        });

        if (activePlan?.limits) {
            const limits = activePlan.limits as { maxLocations?: number, hasWatermark?: boolean };
            maxLocations = limits.maxLocations ?? 1;
        }
    } else {
        // Evaluate Trial
        const trialDays = (Date.now() - membership.business.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        if (trialDays > 7) {
            throw new Error("Your trial has expired. Subscribe to add locations.");
        }
    }

    const currentLocationsCount = await prisma.businessLocation.count({
        where: { businessId: membership.businessId }
    });

    if (currentLocationsCount >= maxLocations) {
        throw new Error(`Limit Exceeded: Your active plan allows up to ${maxLocations} location${maxLocations > 1 ? 's' : ''}. Please upgrade your subscription to add more.`);
    }

    await prisma.businessLocation.create({
        data: {
            businessId: membership.businessId,
            name,
            address,
            googlePlaceId
        }
    });

    revalidatePath("/dashboard/locations");
    return { success: true };
}

export async function deleteBusinessLocation(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    // Security check to ensure the user actually owns the business this location belongs to
    const membership = await prisma.businessMember.findFirst({
        where: { userId: user.id }
    })

    if (!membership) throw new Error("Unauthorized")

    const location = await prisma.businessLocation.findUnique({ where: { id } });
    if (!location || location.businessId !== membership.businessId) {
        throw new Error("Unauthorized or not found");
    }

    await prisma.businessLocation.delete({
        where: { id }
    })

    revalidatePath("/dashboard/locations");
    return { success: true };
}
