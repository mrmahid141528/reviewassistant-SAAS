'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'

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
