'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return redirect('/login?message=Invalid credentials')
    }

    revalidatePath('/dashboard', 'layout')
    if (email.toLowerCase() === "mrmahid141528@gmail.com") {
        redirect('/superadmin')
    }
    redirect('/dashboard')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    })

    if (error) {
        return redirect('/login?message=' + encodeURIComponent(error.message))
    }

    if (data.user && !data.session) {
        return redirect('/login?message=Account created! Please check your email to verify your account before logging in.')
    }

    revalidatePath('/dashboard', 'layout')
    if (email.toLowerCase() === "mrmahid141528@gmail.com") {
        redirect('/superadmin')
    }
    redirect('/dashboard')
}
