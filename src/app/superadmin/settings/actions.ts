'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

const SUPER_ADMIN_EMAILS = [
    "mrmahid141528@gmail.com"
];

async function verifySuperAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !user.email || !SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase())) {
        throw new Error("Unauthorized Access")
    }
    return user
}

export async function updateSuperAdminProfile(formData: FormData) {
    const authUser = await verifySuperAdmin()

    const newName = formData.get('name') as string
    const newPassword = formData.get('password') as string

    if (!newName) throw new Error("Name is required")

    // Update Prisma DB
    await prisma.user.update({
        where: { email: authUser.email! },
        data: { name: newName }
    })

    // Update Supabase Auth Context
    const supabase = await createClient()

    // We only update password if explicitly provided by the admin using the standard client.
    // If not provided, we only sync the name data safely.
    if (newPassword && newPassword.length >= 6) {
        await supabase.auth.updateUser({ password: newPassword })
    }

    revalidatePath('/superadmin/settings')
    return { success: true }
}
