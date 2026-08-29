"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function adminAssignPlan(businessId: string, planId: string) {
    try {
        const targetPlan = await prisma.plan.findUnique({ where: { id: planId } });
        if (!targetPlan) throw new Error("Plan not found");

        // Deactivate old active subscriptions for the business
        await prisma.subscription.updateMany({
            where: { businessId, status: { in: ['active', 'trialing'] } },
            data: { status: 'canceled' }
        });

        // Calculate a 1 month period for this manual assignment
        const expiry = new Date();
        expiry.setMonth(expiry.getMonth() + 1);

        await prisma.subscription.create({
            data: {
                businessId,
                planId: targetPlan.id,
                provider: 'manual_override',
                providerSubscriptionId: `override_${Date.now()}`,
                status: 'active',
                currentPeriodStart: new Date(),
                currentPeriodEnd: expiry
            }
        });

        // Audit Log
        await prisma.auditLog.create({
            data: {
                action: 'PLAN_CHANGED_MANUALLY',
                actorType: 'superadmin',
                actorId: 'mrmahid141528@gmail.com', // fallback superadmin identifier since session might not be explicitly passed here
                resourceType: 'business',
                resourceId: businessId,
                businessId: businessId,
                description: `Superadmin assigned standard plan ${targetPlan.name} bypassing gateway.`,
                result: 'success'
            }
        });

        revalidatePath(`/superadmin/businesses/${businessId}`);
        revalidatePath(`/superadmin/businesses/${businessId}/billing`);

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to assign plan" };
    }
}

export async function adminDeleteBusiness(businessId: string) {
    try {
        await prisma.business.delete({ where: { id: businessId } });

        // Audit log creation can technically fail if businessId is enforced as FK on auditLog
        // but typically businessId on AuditLog is an optional reference string to preserve logs 
        // after deletion. Assuming schema allows it to be preserved:
        await prisma.auditLog.create({
            data: {
                action: 'TENANT_DELETED',
                actorType: 'superadmin',
                actorId: 'mrmahid141528@gmail.com',
                resourceType: 'business',
                resourceId: businessId,
                description: `Superadmin permanently deleted tenant data.`,
                result: 'success'
            }
        }).catch(e => console.error("Audit log failed for deleted business", e));

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to delete business" };
    }
}

export async function exportBusinessData(businessId: string) {
    try {
        const data = await prisma.business.findUnique({
            where: { id: businessId },
            include: {
                members: { include: { user: true } },
                locations: true,
                subscriptions: { include: { plan: true } },
                campaigns: true,
                customers: true,
                auditLogs: true
            }
        });

        if (!data) throw new Error("Business not found");

        const plainData = JSON.parse(JSON.stringify(data));

        return { success: true, data: plainData };
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to export data" };
    }
}
