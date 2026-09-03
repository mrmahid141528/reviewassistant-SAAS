'use server'

import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createCampaignAction(data: { name: string, locationId: string, type: string }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const membership = await prisma.businessMember.findFirst({ where: { userId: user.id }, include: { business: true } })
    if (!membership) return { success: false, error: "Business not found" }

    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 6);

    const actualLocationId = data.locationId === 'all' ? null : data.locationId;

    try {
        await prisma.campaign.create({
            data: {
                businessId: membership.businessId,
                locationId: actualLocationId,
                name: data.name,
                slug: slug,
                settings: { type: data.type },
            }
        })
        revalidatePath("/dashboard/qr")
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function savePrintSettingsAction(data: { brandColor: string, printTitle: string, tagline: string }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const membership = await prisma.businessMember.findFirst({ where: { userId: user.id }, include: { business: true } })
    if (!membership) return { success: false, error: "Business not found" }

    const currentSettings = (membership.business.settings as any) || {};

    try {
        await prisma.business.update({
            where: { id: membership.businessId },
            data: {
                settings: {
                    ...currentSettings,
                    printTemplate: {
                        brandColor: data.brandColor,
                        printTitle: data.printTitle,
                        tagline: data.tagline
                    }
                }
            }
        });
        revalidatePath("/dashboard/qr");
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}
