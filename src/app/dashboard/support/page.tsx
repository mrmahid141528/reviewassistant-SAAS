import prisma from "@/lib/prisma"
import { SupportClient } from "./SupportClient"

export const dynamic = "force-dynamic"

export default async function SupportPage() {
    // 1. Fetch all Published articles
    const articles = await prisma.faqArticle.findMany({
        where: { status: 'published' },
        orderBy: { createdAt: 'desc' }
    });

    // 2. Fetch platform contact info
    const contactSetting = await prisma.platformSetting.findUnique({
        where: { key: 'support_contact' }
    });

    // Default fallback if not configured yet
    const contactData = contactSetting
        ? contactSetting.value as { email: string, whatsapp: string }
        : { email: "support@example.com", whatsapp: "+10000000000" };

    return (
        <SupportClient articles={articles} contact={contactData} />
    )
}
