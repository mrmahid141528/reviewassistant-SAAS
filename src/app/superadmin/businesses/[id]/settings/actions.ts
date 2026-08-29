"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function forceFreeTrialAllocation(businessId: string, adminEmail: string, customDays: number = 30) {
    try {
        // Find or create a master override plan
        let overridePlan = await prisma.plan.findFirst({ where: { slug: 'manual-override-trial' } });
        if (!overridePlan) {
            overridePlan = await prisma.plan.create({
                data: {
                    name: 'Superadmin Override Trial',
                    slug: 'manual-override-trial',
                    priceMonthly: 0,
                    priceYearly: 0,
                    status: 'active',
                    limits: { campaigns: 5, locations: 2 }
                }
            });
        }

        // Deactivate old active subscriptions for the business
        await prisma.subscription.updateMany({
            where: { businessId, status: { in: ['active', 'trialing'] } },
            data: { status: 'canceled' }
        });

        // Create new direct trial subscription
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + customDays);

        await prisma.subscription.create({
            data: {
                businessId,
                planId: overridePlan.id,
                provider: 'manual_override',
                providerSubscriptionId: `override_${Date.now()}`,
                status: 'trialing',
                currentPeriodStart: new Date(),
                currentPeriodEnd: expiry
            }
        });

        // Audit Log
        await prisma.auditLog.create({
            data: {
                action: 'FORCE_TRIAL_ALLOCATION',
                actorType: 'superadmin',
                actorId: adminEmail,
                resourceType: 'business',
                resourceId: businessId,
                businessId: businessId,
                description: `Superadmin bypassed gateway to force a ${customDays}-day manual trial allocation.`,
                result: 'success'
            }
        });

        revalidatePath(`/superadmin/businesses/${businessId}`);
        revalidatePath(`/superadmin/businesses/${businessId}/billing`);
        revalidatePath(`/superadmin/businesses/${businessId}/settings`);
        revalidatePath(`/superadmin/businesses/${businessId}/audit`);

        return { success: true, days: customDays };
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to force trial allocation" };
    }
}

export async function toggleBusinessSuspendState(businessId: string, currentStatus: string, adminEmail: string) {
    try {
        const newStatus = currentStatus === 'suspended' || currentStatus === 'inactive' ? 'active' : 'suspended';

        await prisma.business.update({
            where: { id: businessId },
            data: { status: newStatus }
        });

        await prisma.auditLog.create({
            data: {
                action: newStatus === 'active' ? 'TENANT_REACTIVATED' : 'TENANT_SUSPENDED',
                actorType: 'superadmin',
                actorId: adminEmail,
                resourceType: 'business',
                resourceId: businessId,
                businessId: businessId,
                description: `Superadmin forced ${newStatus} state on the tenant.`,
                result: 'success'
            }
        });

        revalidatePath(`/superadmin/businesses/${businessId}`);
        revalidatePath(`/superadmin/businesses/${businessId}/settings`);
        revalidatePath(`/superadmin/businesses/${businessId}/audit`);

        return { success: true, newStatus };
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to alter tenant state" };
    }
}
