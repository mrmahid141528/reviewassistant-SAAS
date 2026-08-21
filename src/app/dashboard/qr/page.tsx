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

    if (user) {
        const membership = await prisma.businessMember.findFirst({
            where: { userId: user.id },
            include: { business: true }
        });
        if (membership?.business) {
            businessSlug = membership.business.slug;
        }
    }

    const publicReviewUrl = `${protocol}://${host}/review/${businessSlug}`;

    return <QrClient publicReviewUrl={publicReviewUrl} />;
}
