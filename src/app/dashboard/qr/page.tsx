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
    if (user) {
        const membership = await prisma.businessMember.findFirst({
            where: { userId: user.id },
            include: { business: true }
        });
        if (membership?.business) {
            businessSlug = membership.business.slug;
            locations = await prisma.businessLocation.findMany({
                where: { businessId: membership.businessId },
                select: { id: true, name: true, googlePlaceId: true }
            })
        }
    }

    const publicReviewUrl = `${protocol}://${host}/review/${businessSlug}`;

    return <QrClient publicReviewUrl={publicReviewUrl} locations={locations} />;
}
