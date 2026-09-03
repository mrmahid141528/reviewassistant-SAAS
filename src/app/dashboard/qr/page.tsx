import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { QrClient } from "./qr-client";

export default async function QrCodePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let businessSlug = "default-business";
    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

    let locations: any[] = [];
    let campaigns: any[] = [];
    let recentActivity: any[] = [];
    let businessName = "Default Business";
    let businessLogo = "";
    let printSettings: any = {};
    if (user) {
        const membership = await prisma.businessMember.findFirst({
            where: { userId: user.id },
            include: { business: true }
        });
        if (membership?.business) {
            businessSlug = membership.business.slug;
            businessName = membership.business.name;
            businessLogo = membership.business.logoUrl || "";
            printSettings = (membership.business.settings as any)?.printTemplate || {};

            locations = await prisma.businessLocation.findMany({
                where: { businessId: membership.businessId },
                select: { id: true, name: true, googlePlaceId: true }
            })
            campaigns = await prisma.campaign.findMany({
                where: { businessId: membership.businessId },
                orderBy: { createdAt: 'desc' },
                include: { _count: { select: { feedbackSubmissions: true } } }
            })
            recentActivity = await prisma.feedbackSubmission.findMany({
                where: { businessId: membership.businessId },
                orderBy: { submittedAt: 'desc' },
                take: 3,
                include: { campaign: { select: { name: true } } }
            })
        }
    }

    const publicReviewUrl = `${protocol}://${host}/review/${businessSlug}`;

    return <QrClient
        publicReviewUrl={publicReviewUrl}
        locations={locations}
        campaigns={campaigns}
        recentActivity={recentActivity}
        businessName={businessName}
        businessLogo={businessLogo}
        initialPrintSettings={printSettings}
    />;
}
