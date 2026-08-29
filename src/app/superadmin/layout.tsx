import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SuperadminSidebar } from "@/components/superadmin/SuperadminSidebar";
import { SuperadminHeader } from "@/components/superadmin/SuperadminHeader";
import { getBrandSettings } from "@/lib/brand";

const SUPER_ADMIN_EMAILS = [
    "mrmahid141528@gmail.com"
];

export default async function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Not logged in -> send to login
    if (!user || !user.email) {
        redirect("/login");
    }

    // Not a super admin -> send back to normal dashboard
    if (!user.email || !SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase())) {
        redirect("/dashboard");
    }

    const brandSettings = await getBrandSettings();

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">
            {/* 16-Element SaaS Control Sidebar */}
            <SuperadminSidebar brandSettings={brandSettings} />

            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Global Search Header */}
                <SuperadminHeader adminEmail={user.email} />

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto w-full p-4 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
