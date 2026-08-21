import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Authenticate and auto-provision user/business records in public schema if needed
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        await prisma.user.upsert({
            where: { id: user.id },
            update: { email: user.email },
            create: { id: user.id, email: user.email, name: user.email?.split('@')[0] }
        })

        const membership = await prisma.businessMember.findFirst({ where: { userId: user.id } });
        if (!membership) {
            await prisma.business.create({
                data: {
                    name: "My Digital Business",
                    slug: `biz-${user.id.substring(0, 8)}`,
                    members: {
                        create: {
                            userId: user.id,
                            role: "owner"
                        }
                    }
                }
            })
        }
    }

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <div className="flex flex-1 flex-col">
                <Header />
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
