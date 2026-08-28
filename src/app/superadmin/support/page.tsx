import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import SupportManagerClient from "./SupportManagerClient"

export const dynamic = "force-dynamic"

export default async function SuperadminSupportPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect("/superadmin/login")



    // Fetch existing data
    const articles = await prisma.faqArticle.findMany({
        orderBy: { createdAt: 'desc' }
    });

    const contactSetting = await prisma.platformSetting.findUnique({
        where: { key: 'support_contact' }
    });

    const contactData = contactSetting ? contactSetting.value as { email: string, whatsapp: string } : { email: "", whatsapp: "" };

    return (
        <SupportManagerClient
            initialArticles={articles}
            initialContact={contactData}
        />
    )
}
