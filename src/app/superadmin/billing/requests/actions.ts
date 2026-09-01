"use server"

import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function approvePaymentRequest(orderId: string) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    const SUPER_ADMIN_EMAILS = ["mrmahid141528@gmail.com"];
    if (!user || !user.email || !SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase())) {
        return { error: `Approval Failed: Permission Denied: Superadmin access required. (Debug: auth_user=${user?.email}, auth_error=${authError?.message})` };
    }

    try {
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order || order.status !== 'PENDING') return { error: "Invalid Order or already processed." };

        await prisma.$transaction(async (tx) => {
            await tx.order.update({
                where: { id: orderId },
                data: { status: 'COMPLETED' }
            });

            const sub = await tx.subscription.findFirst({
                where: { businessId: order.businessId, status: 'PAYMENT_PENDING' }
            });

            if (sub) {
                const start = new Date();
                const end = new Date();
                if (order.billingCycle === 'monthly') {
                    end.setMonth(end.getMonth() + 1);
                } else {
                    end.setFullYear(end.getFullYear() + 1);
                }

                await tx.subscription.update({
                    where: { id: sub.id },
                    data: {
                        status: 'active',
                        planId: order.planId,
                        currentPeriodStart: start,
                        currentPeriodEnd: end,
                        updatedAt: new Date()
                    }
                });
            }

            await tx.payment.create({
                data: {
                    businessId: order.businessId,
                    subscriptionId: sub ? sub.id : null,
                    provider: 'WHATSAPP_MANUAL',
                    providerPaymentId: `TXN-${order.orderNumber}`,
                    amount: order.total,
                    currency: 'INR',
                    status: 'success',
                    paidAt: new Date()
                }
            })

            await tx.auditLog.create({
                data: {
                    actorId: user.id,
                    action: 'APPROVED_MANUAL_PAYMENT',
                    resourceType: 'order',
                    resourceId: orderId,
                    businessId: order.businessId,
                    description: `Superadmin verified and approved payment for ${order.orderNumber}`
                }
            })
        });

        revalidatePath('/superadmin/billing/requests')
        return { success: true };
    } catch (e: any) {
        console.error("Superadmin payment approval failed:", e)
        return { error: e.message || 'Verification Failed' };
    }
}
