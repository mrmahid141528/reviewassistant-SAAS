'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { logAudit } from '@/lib/auditLogger'

// --- GETTERS ---

export async function getSecurityMetrics() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [activeSessions, failedLogins, lockedAccounts] = await Promise.all([
        prisma.adminSession.count({ where: { status: 'active' } }),
        prisma.securityEvent.count({
            where: {
                event: 'Failed Login',
                createdAt: { gte: today }
            }
        }),
        prisma.user.count({ where: { status: 'locked' } }) // Assuming we might use this in the future
    ])

    // We don't have a rigid System Status logic, we simulate it based on failed logins / blocked IPs
    const isUnderAttack = failedLogins > 100
    const systemStatus = isUnderAttack ? 'Vulnerable' : 'Secure'

    return { activeSessions, failedLogins, lockedAccounts, systemStatus }
}

export async function getAuthAlerts() {
    return prisma.securityEvent.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' }
    })
}

export async function getActiveSessions() {
    return prisma.adminSession.findMany({
        where: { status: 'active' },
        include: { user: { select: { email: true, name: true } } },
        orderBy: { lastActiveAt: 'desc' }
    })
}

export async function getBlockedIPs() {
    return prisma.blockedIP.findMany({
        orderBy: { blockedAt: 'desc' }
    })
}

export async function getSecuritySettings() {
    let settings = await prisma.securitySetting.findFirst()
    if (!settings) {
        settings = await prisma.securitySetting.create({ data: {} })
    }
    return settings
}

// --- MUTATIONS ---

export async function revokeSession(sessionId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    await prisma.adminSession.update({
        where: { id: sessionId },
        data: { status: 'revoked' }
    })

    await logAudit({
        actorType: 'superadmin',
        actorId: user.id,
        action: 'Revoked Admin Session',
        resourceType: 'session',
        resourceId: sessionId,
    })

    revalidatePath('/superadmin/security')
}

export async function revokeAllOtherSessions() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const internalUser = await prisma.user.findUnique({ where: { email: user.email } })
    if (!internalUser) throw new Error("Internal user not found")

    // Get current IP to try and exclude this specific session (Heuristics approach since we can't tie JWT directly to a record without more robust setup mapping sessionId to JWT token claims)
    const headersList = await headers()
    const currentIp = (headersList.get('x-forwarded-for') ?? '').split(',')[0] || headersList.get('x-real-ip') || 'Unknown IP'

    await prisma.adminSession.updateMany({
        where: {
            status: 'active',
            NOT: {
                AND: [
                    { userId: internalUser.id },
                    { ipAddress: currentIp }
                ]
            }
        },
        data: { status: 'revoked' }
    })

    await logAudit({
        actorType: 'superadmin',
        actorId: user.id,
        action: 'Revoked All Other Sessions',
        resourceType: 'system',
    })

    revalidatePath('/superadmin/security')
}

export async function blockIP(ipAddress: string, reason: string = 'Manually Blocked') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    await prisma.blockedIP.upsert({
        where: { ipAddress },
        create: { ipAddress, reason, status: 'blocked' },
        update: { status: 'blocked', reason }
    })

    await logAudit({
        actorType: 'superadmin',
        actorId: user.id,
        action: 'Blocked IP',
        resourceType: 'ip',
        resourceId: ipAddress,
        description: reason,
        afterData: { status: 'blocked', reason }
    })

    revalidatePath('/superadmin/security')
}

export async function unblockIP(ipAddress: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    await prisma.blockedIP.update({
        where: { ipAddress },
        data: { status: 'unblocked' }
    })

    await logAudit({
        actorType: 'superadmin',
        actorId: user.id,
        action: 'Unblocked IP',
        resourceType: 'ip',
        resourceId: ipAddress,
        afterData: { status: 'unblocked' }
    })

    revalidatePath('/superadmin/security')
}

export async function toggleLockdownMode(enabled: boolean) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const settings = await getSecuritySettings()

    await prisma.securitySetting.update({
        where: { id: settings.id },
        data: { lockdownEnabled: enabled }
    })

    await logAudit({
        actorType: 'superadmin',
        actorId: user.id,
        action: enabled ? 'Enabled Lockdown Mode' : 'Disabled Lockdown Mode',
        resourceType: 'system',
        afterData: { lockdownEnabled: enabled }
    })

    revalidatePath('/superadmin/security')
}

export async function updateSecuritySettings(data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const currentSettings = await getSecuritySettings()

    await prisma.securitySetting.update({
        where: { id: currentSettings.id },
        data: {
            admin2faEnabled: data.admin2faEnabled,
            sessionTimeout: data.sessionTimeout,
            maxLoginAttempts: data.maxLoginAttempts,
            accountLockDuration: data.accountLockDuration,
            loginNotification: data.loginNotification,
            newDeviceNotification: data.newDeviceNotification,
            suspiciousLoginDetect: data.suspiciousLoginDetect,
            maxConcurrentSessions: data.maxConcurrentSessions,
            revokeOnPasswordChange: data.revokeOnPasswordChange,
            lockdownEnabled: data.lockdownEnabled !== undefined ? data.lockdownEnabled : currentSettings.lockdownEnabled
        }
    })

    await logAudit({
        actorType: 'superadmin',
        actorId: user.id,
        action: 'Updated Security Settings',
        resourceType: 'system',
        beforeData: currentSettings,
        afterData: data
    })

    revalidatePath('/superadmin/security/settings')
    revalidatePath('/superadmin/security')
}
