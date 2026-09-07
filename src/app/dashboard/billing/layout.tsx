import { ReactNode } from "react"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"

export default async function BillingLayout({ children }: { children: ReactNode }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect("/login")

    // Fetch user membership & role
    const membership = await prisma.businessMember.findFirst({
        where: { userId: user.id },
        select: { role: true }
    })

    const role = membership?.role || "staff"

    // Restrict access to admins/owners entirely
    if (role === "manager" || role === "viewer") {
        return (
            <div className="flex items-center justify-center h-full p-8 text-center text-muted-foreground">
                You do not have permission to access billing configurations. Only Owners and Admins can view this page.
            </div>
        )
    }

    return (
        <div className="w-full max-w-5xl mx-auto animate-in fade-in duration-500 pb-20 md:p-8">
            {children}
        </div>
    )
}
