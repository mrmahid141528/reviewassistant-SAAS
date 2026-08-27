import { ReactNode } from "react"
import { BillingNav } from "./BillingNav"
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
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0 p-8 max-w-7xl mx-auto animate-in fade-in duration-500 pb-20">
            <aside className="lg:w-1/4 shrink-0 max-w-xs">
                <nav className="sticky top-8">
                    <div className="mb-8 hidden lg:block">
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">Billing & Plans</h2>
                        <p className="text-muted-foreground mt-2 text-sm font-medium">
                            Manage your subscription, monitor usage, and view invoices.
                        </p>
                    </div>
                    <BillingNav role={role} />
                </nav>
            </aside>
            <div className="flex-1 w-full max-w-5xl lg:px-4">{children}</div>
        </div>
    )
}
