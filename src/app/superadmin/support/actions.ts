"use server"

import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createFaqArticle(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const category = formData.get("category") as string || "general"
    const status = formData.get("status") as string || "published"

    if (!title || !content) {
        throw new Error("Title and content are required.")
    }

    await prisma.faqArticle.create({
        data: {
            title,
            content,
            category,
            status
        }
    })

    revalidatePath("/superadmin/support")
    revalidatePath("/dashboard/support")
}

export async function deleteFaqArticle(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    await prisma.faqArticle.delete({
        where: { id }
    })

    revalidatePath("/superadmin/support")
    revalidatePath("/dashboard/support")
}

export async function updatePlatformContact(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    const email = formData.get("email") as string
    const whatsapp = formData.get("whatsapp") as string

    if (!email || !whatsapp) {
        throw new Error("Email and whatsapp are required.")
    }

    const payload = {
        email,
        whatsapp
    }

    await prisma.platformSetting.upsert({
        where: { key: "support_contact" },
        update: { value: payload },
        create: {
            key: "support_contact",
            value: payload
        }
    })

    revalidatePath("/superadmin/support")
    revalidatePath("/dashboard/support")
}
