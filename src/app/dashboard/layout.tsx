import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Authenticate and auto-provision user/business records in public schema if needed
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        const prismaUser = await prisma.user.upsert({
            where: { id: user.id },
            update: { email: user.email },
            create: { id: user.id, email: user.email, name: user.email?.split('@')[0] }
        })

        const membership = await prisma.businessMember.findFirst({
            where: { userId: user.id },
            include: { business: true }
        });

        if (prismaUser.status === 'suspended' || (membership && membership.business.status === 'suspended')) {
            return (
                <div className="flex min-h-screen bg-background">
                    <Sidebar />
                    <div className="flex flex-1 flex-col">
                        <Header />
                        <main className="flex-1 overflow-y-auto p-4 md:p-8 flex items-center justify-center">
                            <div className="flex items-center justify-center flex-col gap-4 text-center px-4 max-w-lg mx-auto border p-12 rounded-xl bg-white shadow-sm mt-12">
                                <span className="text-6xl mb-2">⛔</span>
                                <h1 className="text-2xl font-bold text-red-600">Account Suspended</h1>
                                <p className="text-muted-foreground text-sm">Your business campaign has been paused by the platform administrator. You can still access your account ID, but active services are temporarily disabled.</p>
                                <a href="mailto:support@mrmahid.com" className="mt-6 px-6 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition">
                                    Contact Administration
                                </a>
                            </div>
                        </main>
                    </div>
                </div>
            )
        }

        if (!membership) {
            redirect("/onboarding");
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
