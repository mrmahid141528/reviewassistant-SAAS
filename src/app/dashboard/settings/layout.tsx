import { ReactNode } from "react"
import { createClient } from "@/lib/supabase/server"
import prisma from "@/lib/prisma"



export default async function SettingsLayout({ children }: { children: ReactNode }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const membership = user ? await prisma.businessMember.findFirst({
        where: { userId: user.id }
    }) : null;
    const role = membership?.role;

    return (
        <div className="flex-1 w-full max-w-5xl md:p-4">
            {children}
        </div>
    )
}
