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

        const membership = await prisma.businessMember.findFirst({
            where: { userId: user.id },
            include: { business: true }
        });

        if (!membership || !membership.business) {
            return NextResponse.json({ error: "No associated business found" }, { status: 400 });
        }

        const business = membership.business;

        const body = await req.json();
        const { planId, cycle, total } = body;

        if (!planId || !total) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        if (!keyId || !keySecret || keyId === "undefined" || keySecret === "undefined" || keyId.trim() === "" || keySecret.trim() === "") {
            return NextResponse.json({
                error: "Payment configuration is missing."
            }, { status: 500 });
        }

        const instance = new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
        });

        // Amount must be in the smallest currency unit (paise for INR)
        const amountInPaise = Math.round(total * 100);

        const order = await instance.orders.create({
            amount: amountInPaise,
            currency: "INR",
            receipt: `receipt_${business.id.substring(0, 8)}_${Date.now()}`,
            notes: {
                business_id: business.id,
                plan_id: planId,
                cycle: cycle || 'monthly'
            }
        });

        return NextResponse.json({ orderId: order.id, amount: amountInPaise, keyId }, { status: 200 });
    } catch (error: any) {
        console.error("Razorpay Checkout Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
