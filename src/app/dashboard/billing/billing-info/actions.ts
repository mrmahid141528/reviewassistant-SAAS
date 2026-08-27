'use server'

import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateBillingInfo(formData: FormData) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return { error: "Authentication failed. Not logged in." }

        const membership = await prisma.businessMember.findFirst({
            where: { userId: user.id },
            include: { business: true }
        })
        if (!membership) return { error: "No business membership found for this user." }

        const currentSettings = membership.business.settings && typeof membership.business.settings === "object"
            ? { ...(membership.business.settings as Record<string, any>) }
            : {};

        const billing = currentSettings.billing || {};

        billing.billingName = formData.get("billingName") as string || "";
        billing.billingEmail = formData.get("billingEmail") as string || "";
        billing.billingPhone = formData.get("billingPhone") as string || "";
        billing.billingAddress = formData.get("billingAddress") as string || "";
        billing.billingCity = formData.get("billingCity") as string || "";
        billing.billingState = formData.get("billingState") as string || "";
        billing.billingPostalCode = formData.get("billingPostalCode") as string || "";
        billing.billingCountry = formData.get("billingCountry") as string || "";
        billing.isGstRegistered = formData.get("isGstRegistered") === "on";
        billing.gstin = formData.get("gstin") as string || "";
        billing.tradingName = formData.get("tradingName") as string || "";

        currentSettings.billing = billing;

        await prisma.business.update({
            where: { id: membership.businessId },
            data: {
                settings: currentSettings,
            }
        });

        revalidatePath("/dashboard/billing/billing-info")
        return { success: true, message: "Billing info updated successfully!" }
    } catch (e: any) {
        console.error("Error in updateBillingInfo:", e)
        return { error: e.message || "An unexpected error occurred." }
    }
}
