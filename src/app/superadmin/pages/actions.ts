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

    if (!user || !user.email || !SUPER_ADMIN_EMAILS.includes(user.email)) {
        throw new Error("Unauthorized Access")
    }
}

export async function saveLegalPage(formData: FormData) {
    await verifySuperAdmin()

    const id = formData.get('id') as string | null
    const title = formData.get('title') as string
    const slug = formData.get('slug') as string
    const content = formData.get('content') as string
    const status = formData.get('status') as string

    if (!title || !slug || !content) {
        throw new Error("Title, slug and content are required")
    }

    if (id) {
        await prisma.legalPage.update({
            where: { id },
            data: { title, slug: slug.toLowerCase(), content, status }
        })
    } else {
        await prisma.legalPage.create({
            data: { title, slug: slug.toLowerCase(), content, status }
        })
    }

    revalidatePath('/superadmin/pages')
    revalidatePath(`/legal/${slug}`)
}

export async function deleteLegalPage(formData: FormData) {
    await verifySuperAdmin()
    const id = formData.get('id') as string

    await prisma.legalPage.delete({
        where: { id }
    })

    revalidatePath('/superadmin/pages')
}
