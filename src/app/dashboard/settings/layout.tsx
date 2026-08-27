import { ReactNode } from "react"
import { createClient } from "@/lib/supabase/server"
import prisma from "@/lib/prisma"

import { SettingsNav } from "./SettingsNav"

export default async function SettingsLayout({ children }: { children: ReactNode }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const membership = user ? await prisma.businessMember.findFirst({
        where: { userId: user.id }
    }) : null;
    const role = membership?.role;

    return (
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0 pb-16">
            <aside className="-mx-4 lg:w-1/5">
                <div className="mb-8 px-4 lg:px-0">
                    <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                    <p className="text-muted-foreground text-sm">
                        Configure your workspace settings and preferences.
                    </p>
                </div>
                <SettingsNav role={role} />
            </aside>
            <div className="flex-1 max-w-4xl">{children}</div>
        </div>
    )
}
