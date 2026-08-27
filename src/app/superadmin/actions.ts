'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import prisma from '@/lib/prisma'

function getAdminClient() {
    return createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )
}

const SUPER_ADMIN_EMAILS = [
    "mrmahid141528@gmail.com"
];

async function verifySuperAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !user.email || !SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase())) {
        throw new Error("Unauthorized Access")
    }
}

export async function toggleUserStatus(formData: FormData) {
    await verifySuperAdmin()

    const userId = formData.get('userId') as string
    const currentStatus = formData.get('currentStatus') as string

    const newStatus = currentStatus === 'active' ? 'suspended' : 'active'

    await prisma.user.update({
        where: { id: userId },
        data: { status: newStatus }
    })

    revalidatePath('/superadmin/users')
}

export async function deleteUser(formData: FormData) {
    await verifySuperAdmin()
    const userId = formData.get('userId') as string

    // Prisma Cascade delete will handle relationships
    await prisma.user.delete({
        where: { id: userId }
    })

    revalidatePath('/superadmin/users')
}

export async function toggleBusinessStatus(formData: FormData) {
    await verifySuperAdmin()

    const businessId = formData.get('businessId') as string
    const currentStatus = formData.get('currentStatus') as string

    const newStatus = currentStatus === 'active' ? 'suspended' : 'active'

    await prisma.business.update({
        where: { id: businessId },
        data: { status: newStatus }
    })

    revalidatePath('/superadmin/businesses')
}

export async function deleteBusiness(formData: FormData) {
    await verifySuperAdmin()
    const businessId = formData.get('businessId') as string

    await prisma.business.delete({
        where: { id: businessId }
    })

    revalidatePath('/superadmin/businesses')
}

export async function editUser(formData: FormData) {
    await verifySuperAdmin()

    const userId = formData.get('userId') as string
    const newName = formData.get('name') as string
    const newEmail = formData.get('email') as string

    await prisma.user.update({
        where: { id: userId },
        data: { name: newName, email: newEmail }
    })

    const adminAuth = getAdminClient().auth.admin
    await adminAuth.updateUserById(userId, { email: newEmail })

    revalidatePath('/superadmin/users')
}

export async function resetUserPassword(formData: FormData) {
    await verifySuperAdmin()

    const userId = formData.get('userId') as string
    const newPassword = formData.get('password') as string

    const adminAuth = getAdminClient().auth.admin
    await adminAuth.updateUserById(userId, { password: newPassword })

    revalidatePath('/superadmin/users')
}

export async function assignBusinessPlan(formData: FormData) {
    await verifySuperAdmin()

    const businessId = formData.get('businessId') as string
    const planId = formData.get('planId') as string

    const oneYearFromNow = new Date()
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)

    if (!planId || planId === 'none') {
        await prisma.business.update({
            where: { id: businessId },
            data: {
                razorpayPlanId: null,
                razorpayCurrentPeriodEnd: new Date() // Expire instantly
            }
        })

        // Cancel manual subscriptions
        await prisma.subscription.updateMany({
            where: { businessId, status: 'active', provider: 'manual' },
            data: { status: 'canceled', currentPeriodEnd: new Date() }
        })
    } else {
        await prisma.business.update({
            where: { id: businessId },
            data: {
                razorpayPlanId: planId,
                razorpayCurrentPeriodEnd: oneYearFromNow
            }
        })

        try {
            // Upsert manual subscription record so the UI sees it.
            const existingManual = await prisma.subscription.findFirst({
                where: { businessId, provider: 'manual', status: 'active' }
            });

            if (existingManual) {
                await prisma.subscription.update({
                    where: { id: existingManual.id },
                    data: { planId, currentPeriodEnd: oneYearFromNow }
                })
            } else {
                await prisma.subscription.create({
                    data: {
                        businessId,
                        planId,
                        provider: 'manual',
                        providerSubscriptionId: `man_${Date.now()}`,
                        status: 'active',
                        currentPeriodStart: new Date(),
                        currentPeriodEnd: oneYearFromNow
                    }
                })
            }
        } catch (e: any) {
            console.error("PRISMA SUBSCRIPTION ERROR:", e)
            throw e
        }
    }

    revalidatePath('/superadmin/businesses')
    revalidatePath('/dashboard/billing', 'layout')
    revalidatePath('/superadmin/billing', 'layout')
    revalidatePath('/superadmin/pricing', 'layout')
}

export async function updateBusinessDetails(formData: FormData) {
    await verifySuperAdmin()

    const businessId = formData.get('businessId') as string
    const name = formData.get('name') as string
    const slug = formData.get('slug') as string
    const category = formData.get('category') as string
    const timezone = formData.get('timezone') as string

    await prisma.business.update({
        where: { id: businessId },
        data: { name, slug, category, timezone }
    })

}

export async function startImpersonation(businessId: string) {
    await verifySuperAdmin()

    // Find the owner of the business
    const membership = await prisma.businessMember.findFirst({
        where: { businessId, role: 'owner' },
        include: { user: true }
    })

    if (!membership || !membership.user.email) {
        throw new Error("No owner found for this business to impersonate.")
    }

    const adminAuth = getAdminClient().auth.admin
    const { data, error } = await adminAuth.generateLink({
        type: 'magiclink',
        email: membership.user.email
    })

    if (error) {
        throw new Error("Failed to generate impersonation link: " + error.message)
    }

    return data.properties.action_link
}
