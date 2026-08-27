import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const q = url.searchParams.get("q")?.trim() || "";

        if (!q || q.length < 2) {
            return NextResponse.json({
                businesses: [],
                campaigns: [],
                payments: [],
                coupons: []
            });
        }

        // Basic sanity check for Admin auth
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || user.email !== process.env.ADMIN_EMAIL) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // We correctly verified if `user.email` matches an Admin rule.

        const queryValue = q.toLowerCase();

        // Perform parallel queries to maximize database speed and efficiency
        const [businesses, campaigns, payments, coupons] = await Promise.all([
            // 1. Businesses
            prisma.business.findMany({
                where: {
                    OR: [
                        { name: { contains: queryValue, mode: 'insensitive' } },
                        { slug: { contains: queryValue, mode: 'insensitive' } },
                        { email: { contains: queryValue, mode: 'insensitive' } },
                        { id: { contains: queryValue, mode: 'insensitive' } }
                    ]
                },
                include: {
                    subscriptions: {
                        where: { status: 'active' },
                        include: { plan: true },
                        take: 1
                    }
                },
                take: 5
            }),

            // 2. Campaigns (QR Campaigns)
            prisma.campaign.findMany({
                where: {
                    OR: [
                        { name: { contains: queryValue, mode: 'insensitive' } },
                        { slug: { contains: queryValue, mode: 'insensitive' } }
                    ]
                },
                include: {
                    business: true,
                    _count: {
                        select: { feedbackSubmissions: true } // "Scans"
                    }
                },
                take: 5
            }),

            // 4. Payments / Transactions
            prisma.payment.findMany({
                where: {
                    OR: [
                        { providerPaymentId: { contains: queryValue, mode: 'insensitive' } }
                    ]
                },
                include: {
                    business: true
                },
                take: 5
            }),

            // 5. Coupons
            prisma.coupon.findMany({
                where: {
                    code: { contains: queryValue, mode: 'insensitive' }
                },
                take: 5
            })
        ]);

        return NextResponse.json({
            businesses,
            campaigns,
            payments,
            coupons
        });

    } catch (error) {
        console.error("Superadmin Search Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
