'use server'

import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function saveQuestionsLayout(questions: any[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const membership = await prisma.businessMember.findFirst({ where: { userId: user.id } })
    if (!membership) return { success: false, error: "Business not found" }

    // Auto provision campaign if missing
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

    // Since SQLite/Postgres Prisma allows createMany, we just delete existing and replace.
    await prisma.campaignQuestion.deleteMany({
        where: { campaignId: campaign.id }
    })

    if (questions && questions.length > 0) {
        await prisma.campaignQuestion.createMany({
            data: questions.map((q, index) => ({
                campaignId: campaign!.id,
                question: q.question,
                questionType: q.type || 'Text',
                options: Array.isArray(q.options) ? q.options : [],
                required: q.required || false,
                sortOrder: index,
            }))
        })
    }

    revalidatePath("/dashboard/questions")
    return { success: true }
}
