'use server'

import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateBusinessGeneral(formData: FormData) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        const membership = await prisma.businessMember.findFirst({ where: { userId: user.id } })
        if (!membership) return

        const name = formData.get("businessName") as string || "My Business"
        const newSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + "-" + membership.businessId.substring(membership.businessId.length - 4)

        await prisma.business.update({
            where: { id: membership.businessId },
            data: {
                name: name,
                slug: newSlug,
                websiteUrl: formData.get("websiteUrl") as string || null,
                phone: formData.get("phone") as string || null,
                email: formData.get("email") as string || null,
            }
        })

        revalidatePath("/dashboard/settings")
    } catch (e: any) {
        console.error("Error in updateBusinessGeneral:", e)
        throw new Error(e.message) // Next.js handles this to show in UI
    }
}

export async function updateGoogleConfig(formData: FormData) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const membership = await prisma.businessMember.findFirst({ where: { userId: user.id } })
        if (!membership) return

        let campaign = await prisma.campaign.findFirst({ where: { businessId: membership.businessId } })

        if (!campaign) {
            campaign = await prisma.campaign.create({
                data: {
                    businessId: membership.businessId,
                    name: "Main Review Campaign",
                    slug: "main-campaign"
                }
            })
        }

        // Use spread to prevent mutation of frozen Prisma objects from cache
        const currentSettings = campaign.settings && typeof campaign.settings === 'object' ? { ...(campaign.settings as any) } : {}
        currentSettings.googleReviewUrl = formData.get("googleUrl") as string || ""

        await prisma.campaign.update({
            where: { id: campaign.id },
            data: { settings: currentSettings }
        })

        revalidatePath("/dashboard/settings")
    } catch (e: any) {
        console.error("Error in updateGoogleConfig:", e)
        throw new Error(e.message)
    }
}

export async function updateAIPreferences(formData: FormData) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const membership = await prisma.businessMember.findFirst({ where: { userId: user.id } })
        if (!membership) return

        let campaign = await prisma.campaign.findFirst({ where: { businessId: membership.businessId } })

        if (!campaign) {
            campaign = await prisma.campaign.create({
                data: {
                    businessId: membership.businessId,
                    name: "Main Review Campaign",
                    slug: "main-campaign"
                }
            })
        }

        const currentSettings = campaign.settings && typeof campaign.settings === 'object' ? { ...(campaign.settings as any) } : {}
        currentSettings.aiLanguage = formData.get("language") as string || "English"
        currentSettings.aiTone = formData.get("tone") as string || "Professional & Friendly"

        await prisma.campaign.update({
            where: { id: campaign.id },
            data: { settings: currentSettings }
        })

        revalidatePath("/dashboard/settings")
    } catch (e: any) {
        console.error("Error in updateAIPreferences:", e)
        throw new Error(e.message)
    }
}
