import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const bodyText = await req.text();
        const signature = req.headers.get("x-razorpay-signature");
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

        if (!signature || !webhookSecret) {
            return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 });
        }

        // Verify Razorpay Webhook Signature
        const expectedSignature = crypto
            .createHmac("sha256", webhookSecret)
            .update(bodyText)
            .digest("hex");

        if (expectedSignature !== signature) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }

        const payload = JSON.parse(bodyText);
        const event = payload.event;
        const subscription = payload.payload.subscription?.entity;

        if (!subscription) {
            return NextResponse.json({ ok: true });
        }

        const razorpaySubscriptionId = subscription.id;
        const razorpayCustomerId = subscription.customer_id;
        const razorpayPlanId = subscription.plan_id;
        const currentPeriodEnd = new Date(subscription.current_end * 1000);
        const status = subscription.status;

        // In Razorpay, "active" means billing is working. "halted" or "cancelled" means it's inactive.

        // Find if this business already has this subscription ID or customer ID
        // Often, we pass `notes.business_id` when creating the subscription to easily link it later.
        const businessId = subscription.notes?.business_id;

        if (businessId) {
            if (event === "subscription.charged" || event === "subscription.activated") {
                await prisma.business.update({
                    where: { id: businessId },
                    data: {
                        razorpayCustomerId,
                        razorpaySubscriptionId,
                        razorpayPlanId,
                        razorpayCurrentPeriodEnd: currentPeriodEnd,
                    }
                });
            } else if (event === "subscription.cancelled" || event === "subscription.halted") {
                // Keep the IDs but, we could clear planId to signify free tier, or handle restrictions in middleware based on end date vs now.
                // We'll trust currentPeriodEnd for middleware, but let's clear the Sub ID to be safe if cancelled.
                await prisma.business.update({
                    where: { id: businessId },
                    data: {
                        razorpayPlanId: null,
                        razorpayCurrentPeriodEnd: new Date(), // End it immediately or let it expire dynamically.
                    }
                });
            }
        }

        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (error: any) {
        console.error("Razorpay Webhook Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
