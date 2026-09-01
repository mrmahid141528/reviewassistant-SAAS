'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { headers } from 'next/headers'

export async function submitLogin(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // --- SOC Implementation ---
    const headersList = await headers()
    const ipAddress = (headersList.get('x-forwarded-for') ?? '').split(',')[0] || headersList.get('x-real-ip') || 'Unknown IP'
    const userAgent = headersList.get('user-agent') || 'Unknown User-Agent'

    // 1. Check if IP is blocked
    const blocked = await prisma.blockedIP.findUnique({
        where: { ipAddress: ipAddress }
    })

    if (blocked && blocked.status === 'blocked') {
        await prisma.securityEvent.create({
            data: {
                email,
                event: 'Blocked IP Login Attempt',
                ipAddress,
                userAgent,
                status: 'Suspicious'
            }
        })
        return { error: 'Access denied from this IP address.' }
    }

    // 2. Check Lockdown mode
    const settings = await prisma.securitySetting.findFirst()
    const isSuperadmin = email.trim().toLowerCase() === "mrmahid141528@gmail.com"
    if (settings?.lockdownEnabled && !isSuperadmin) {
        return { error: 'System is currently in lockdown mode. Admin logins disabled temporarily.' }
    }
    // ----------------------------

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        // --- Track Failed Login ---
        await prisma.securityEvent.create({
            data: {
                email,
                event: 'Failed Login',
                ipAddress,
                userAgent,
                status: 'Failed'
            }
        })
        return { error: 'Incorrect email or password.' }
    }

    // --- On Success, create AdminSession ---
    const internalUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
    })

    if (internalUser) {
        // Create an active session
        await prisma.adminSession.create({
            data: {
                userId: internalUser.id,
                ipAddress,
                userAgent,
                status: 'active'
            }
        })
    }
    // ---------------------------------------

    revalidatePath('/dashboard', 'layout')
    if (isSuperadmin) {
        return { success: true, redirect: '/superadmin' }
    }
    return { success: true, redirect: '/dashboard' }
}

export async function submitSignup(formData: FormData) {
    const supabase = await createClient()

    const fullName = formData.get('fullName') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    console.log("Checking Supabase Env during Signup:");
    console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            }
        }
    })

    if (error) {
        return { error: error.message }
    }

    if (data.user && !data.session) {
        return { success: true }
    }

    revalidatePath('/dashboard', 'layout')
    if (email.toLowerCase() === "mrmahid141528@gmail.com") {
        redirect('/superadmin')
    }
    redirect('/dashboard')
}

export async function continueWithGoogle() {
    const supabase = await createClient()

    // Assuming we have a base URL in env or using request headers? 
    // In server actions, getting the origin can be tricky. We use process.env.NEXT_PUBLIC_SITE_URL usually, 
    // but the easiest is providing the redirect URL that Supabase configured.
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`
        }
    })

    if (error) {
        redirect('/login?error=google')
    }

    if (data.url) {
        redirect(data.url)
    }
}
