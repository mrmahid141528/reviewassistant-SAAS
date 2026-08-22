'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import prisma from '@/lib/prisma'

function getAdminClient() {
    return createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

const SUPER_ADMIN_EMAILS = [
    "mrmahid141528@gmail.com"
];

async function verifySuperAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !user.email || !SUPER_ADMIN_EMAILS.includes(user.email)) {
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

    // Setup a 1 year manual extension period explicitly from today
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
    } else {
        await prisma.business.update({
            where: { id: businessId },
            data: {
                razorpayPlanId: planId,
                razorpayCurrentPeriodEnd: oneYearFromNow
            }
        })
    }

    revalidatePath('/superadmin/businesses')
}
