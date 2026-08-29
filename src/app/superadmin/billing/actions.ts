"use server"

import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

const SUPER_ADMIN_EMAILS = ["mrmahid141528@gmail.com"]

export async function getBillingConfig() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Ensure this returns defaults nicely for the frontend when called from unauth checkout
    // Wait, getBillingConfig should be accessible by CHECKOUT clients to get the tax %!
    // So NO Superadmin check for reading it.

    const config = await prisma.platformSetting.findUnique({
        where: { key: 'billing_config' }
    })

    if (!config || !config.value) {
        return { whatsappNumber: "", gstPercentage: 18 }
    }

    return config.value as { whatsappNumber: string, gstPercentage: number }
}

export async function updateBillingConfig(data: { whatsappNumber: string, gstPercentage: number }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !user.email || !SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase())) {
        return { error: 'Unauthorized' }
    }

    try {
        await prisma.platformSetting.upsert({
            where: { key: 'billing_config' },
            create: {
                key: 'billing_config',
                value: data
            },
            update: {
                value: data
            }
        })
        return { success: true }
    } catch (e: any) {
        return { error: e.message || 'Failed to save config' }
    }
}
