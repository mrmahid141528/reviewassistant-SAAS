'use server'

import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';

const SUPER_ADMIN = "mrmahid141528@gmail.com";

async function checkAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email?.toLowerCase() !== SUPER_ADMIN) {
        throw new Error("Unauthorized: Superadmin access required.");
    }
    return user;
}

export async function exportDatabaseState() {
    try {
        await checkAdmin();

        const [users, businesses, campaigns, subscriptions] = await prisma.$transaction([
            prisma.user.findMany({ select: { id: true, email: true, name: true, status: true, createdAt: true } }),
            prisma.business.findMany({ select: { id: true, name: true, slug: true, email: true, status: true, createdAt: true } }),
            prisma.campaign.findMany({ select: { id: true, name: true, businessId: true, status: true } }),
            prisma.subscription.findMany({ select: { id: true, businessId: true, provider: true, status: true } })
        ]);

        const dumpPayload = {
            metadata: {
                exportedAt: new Date().toISOString(),
                version: "1.0"
            },
            data: {
                users,
                businesses,
                campaigns,
                subscriptions
            }
        };

        return { success: true, payload: dumpPayload };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function triggerCloudBackup() {
    try {
        const user = await checkAdmin();
        const exportRes = await exportDatabaseState();
        if (!exportRes.success) throw new Error(exportRes.error);

        const supabaseAdmin = createSupabaseAdmin(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data: bucketData, error: bucketError } = await supabaseAdmin.storage.getBucket('platform-backups');
        if (bucketError) {
            await supabaseAdmin.storage.createBucket('platform-backups', { public: false });
        }

        const fileName = `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        const fileContent = JSON.stringify(exportRes.payload, null, 2);

        const { error: uploadError } = await supabaseAdmin.storage
            .from('platform-backups')
            .upload(fileName, fileContent, {
                contentType: 'application/json',
                upsert: true
            });

        if (uploadError) throw new Error("Failed to upload payload to cloud block storage.");

        await prisma.auditLog.create({
            data: {
                action: "trigger_cloud_backup",
                actorType: "superadmin",
                actorId: user.id,
                resourceType: "database",
                description: `Manual database backup triggered: ${fileName}`
            }
        });

        return { success: true, message: "Backup securely synced to cloud." };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function purgeOrphanedRecords() {
    try {
        const user = await checkAdmin();

        // 1. Delete Businesses where status is deleted/suspended if they are orphans
        // Or actually the requirement is deleting stuff mathematically known as "trash"
        const { count: bCount } = await prisma.business.deleteMany({
            where: { status: 'deleted' }
        });

        await prisma.auditLog.create({
            data: {
                action: "purge_orphaned_records",
                actorType: "superadmin",
                actorId: user.id,
                resourceType: "database",
                description: `Purged ${bCount} soft-deleted business records permanently.`
            }
        });

        return { success: true, message: `Successfully purged ${bCount} isolated records.` };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function factoryResetSaaS() {
    try {
        const user = await checkAdmin();

        // 1. Delete all tenants
        const { count: bCount } = await prisma.business.deleteMany({});

        // 2. Delete all users except Superadmin
        const { count: uCount } = await prisma.user.deleteMany({
            where: {
                email: {
                    not: SUPER_ADMIN
                }
            }
        });

        await prisma.auditLog.create({
            data: {
                action: "factory_reset_saas",
                actorType: "superadmin",
                actorId: user.id,
                resourceType: "database",
                description: `SYSTEM WIPE: Deleted ${bCount} businesses and ${uCount} user records.`
            }
        });

        return { success: true, message: "System Factory Reset Complete. All tenant records destroyed." };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
