import prisma from '@/lib/prisma'

export type ActorType = 'superadmin' | 'admin' | 'business_owner' | 'staff' | 'system' | 'system_worker'
export type AuditLogResult = 'success' | 'warning' | 'failed'

export interface AuditLogOptions {
    actorType?: ActorType
    actorId?: string
    action: string
    resourceType: string
    resourceId?: string
    businessId?: string
    description?: string
    result?: AuditLogResult
    beforeData?: any
    afterData?: any
    ipAddress?: string
    userAgent?: string
    sessionId?: string
}

/**
 * Creates an immutable record in the audit_logs ledger.
 * This is meant to be called server-side after successful mutations.
 */
export async function logAudit(options: AuditLogOptions) {
    try {
        await prisma.auditLog.create({
            data: {
                actorType: options.actorType || 'system',
                actorId: options.actorId,
                action: options.action,
                resourceType: options.resourceType,
                resourceId: options.resourceId,
                businessId: options.businessId,
                description: options.description,
                result: options.result || 'success',
                beforeData: options.beforeData ? JSON.parse(JSON.stringify(options.beforeData)) : undefined,
                afterData: options.afterData ? JSON.parse(JSON.stringify(options.afterData)) : undefined,
                ipAddress: options.ipAddress,
                userAgent: options.userAgent,
                sessionId: options.sessionId,
            }
        })
    } catch (error) {
        console.error("Critical: Failed to record audit log", error)
        // We catch this so the main business logic doesn't rollback if purely the logging fails, 
        // though in high-security systems you might want it to throw.
    }
}
