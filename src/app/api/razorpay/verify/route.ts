import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            planId,
            cycle
        } = body;

        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) {
            return NextResponse.json({ error: "Secret missing" }, { status: 500 });
        }

        // Verify Signature
        const generated_signature = crypto
            .createHmac('sha256', secret)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest('hex');

        if (generated_signature === razorpay_signature) {
            // Payment is successful

            const membership = await prisma.businessMember.findFirst({
                where: { userId: user.id },
            });

            if (!membership) return NextResponse.json({ error: "Business missing" }, { status: 400 });

            // Calculate new period end
            const currentPeriodEnd = new Date();
            if (cycle === 'yearly') {
                currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
            } else {
                currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
            }

            await prisma.business.update({
                where: { id: membership.businessId },
                data: {
                    razorpayPlanId: planId,
                    razorpayCurrentPeriodEnd: currentPeriodEnd,
                }
            });

            // Add the subscription record also
            await prisma.subscription.create({
                data: {
                    businessId: membership.businessId,
                    planId: planId,
                    provider: "razorpay",
                    providerSubscriptionId: razorpay_order_id, // For mapping purposes if we use orders
                    status: "active",
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: currentPeriodEnd,
                }
            });

            return NextResponse.json({ success: true, message: "Payment verified successfully" }, { status: 200 });
        } else {
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
