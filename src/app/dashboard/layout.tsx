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
                    <Sidebar role={membership?.role} />
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

    let isExpired = false;
    if (user) {
        const membership = await prisma.businessMember.findFirst({
            where: { userId: user.id },
            include: { business: true }
        });

        if (membership) {
            const b = membership.business;
            if (!b.razorpayPlanId) {
                const daysSinceCreated = (Date.now() - b.createdAt.getTime()) / (1000 * 60 * 60 * 24);
                if (daysSinceCreated > 7) {
                    isExpired = true;
                }
            }
        }
    }

    let userAvatar = null;
    let userNameInitials = "MR";
    if (user) {
        const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
        if (dbUser) {
            userAvatar = dbUser.image;
            userNameInitials = dbUser.name ? dbUser.name.slice(0, 2).toUpperCase() : "USR";
        }
    }

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar role={user ? (await prisma.businessMember.findFirst({ where: { userId: user.id } }))?.role : undefined} />
            <div className="flex flex-1 flex-col">
                <Header userAvatar={userAvatar} userNameInitials={userNameInitials} />
                <main className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col">
                    {isExpired && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                                <span className="text-xl">⚠️</span>
                                <div>
                                    <h3 className="font-bold">Subscription Error: No Active Plan</h3>
                                    <p className="text-sm">Your trial or active subscription has expired. API generation services are suspended until you upgrade.</p>
                                </div>
                            </div>
                            <a href="/dashboard/billing" className="px-5 py-2 bg-red-600 text-white rounded-md text-sm font-medium shadow-sm hover:bg-red-700 transition">
                                Renew Now
                            </a>
                        </div>
                    )}
                    {children}
                </main>
            </div>
        </div>
    );
}
