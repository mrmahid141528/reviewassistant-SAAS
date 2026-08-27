'use server'

import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function fetchAuditLogs(filters: {
    action?: string;
    actorType?: string;
    result?: string;
    resourceType?: string;
    search?: string;
}) {
    const where: Prisma.AuditLogWhereInput = {}

    if (filters.action && filters.action !== 'all') where.action = filters.action
    if (filters.actorType && filters.actorType !== 'all') where.actorType = filters.actorType
    if (filters.result && filters.result !== 'all') where.result = filters.result
    if (filters.resourceType && filters.resourceType !== 'all') where.resourceType = filters.resourceType

    if (filters.search) {
        where.OR = [
            { traceId: { contains: filters.search, mode: Prisma.QueryMode.insensitive } },
            { description: { contains: filters.search, mode: Prisma.QueryMode.insensitive } },
            ...((['business', 'user'].includes(filters.resourceType || '')) ? [{ resourceId: { contains: filters.search, mode: Prisma.QueryMode.insensitive } }] : []),
        ]
    }

    const logs = await prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 100,
    })

    return logs
}

export async function fetchAuditKPIs() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [totalEvents, todayEvents, warningEvents, errorEvents] = await Promise.all([
        prisma.auditLog.count(),
        prisma.auditLog.count({ where: { createdAt: { gte: today } } }),
        prisma.auditLog.count({ where: { result: 'warning' } }),
        prisma.auditLog.count({ where: { result: 'failed' } })
    ])

    return { totalEvents, todayEvents, warningEvents, errorEvents }
}
