'use server'

import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateBusinessSettings(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const membership = await prisma.businessMember.findFirst({ where: { userId: user.id } })
    if (!membership) return

    await prisma.business.update({
        where: { id: membership.businessId },
        data: {
            name: formData.get("businessName") as string || "My Business",
            websiteUrl: formData.get("websiteUrl") as string || null,
            phone: formData.get("phone") as string || null,
            email: formData.get("email") as string || null,
        }
    })

    revalidatePath("/dashboard/settings")
}
