import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import Razorpay from "razorpay";

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || !user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // We assume the user has a business, let's find it.
        const membership = await prisma.businessMember.findFirst({
            where: { userId: user.id },
            include: { business: true }
        });

        if (!membership || !membership.business) {
            return NextResponse.json({ error: "No associated business found" }, { status: 400 });
        }

        const business = membership.business;

        const body = await req.json();
        const planId = body.planId; // The ID of the plan they clicked on the frontend

        if (!planId) {
            return NextResponse.json({ error: "Plan ID is required" }, { status: 400 });
        }

        // Initialize Razorpay SDK
        const instance = new Razorpay({
            key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string,
            key_secret: process.env.RAZORPAY_KEY_SECRET as string,
        });

        // Create a subscription on Razorpay
        const subscription = await instance.subscriptions.create({
            plan_id: planId,
            customer_notify: 1, // Razorpay sends emails automatically
            total_count: 120,    // 10 years by default for recurring monthly
            notes: {
                business_id: business.id // Crucial for parsing in the webhook later
            }
        });

        // Return the subscription ID so the frontend can open the checkout overlay
        return NextResponse.json({ subscriptionId: subscription.id }, { status: 200 });
    } catch (error: any) {
        console.error("Razorpay Checkout Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
