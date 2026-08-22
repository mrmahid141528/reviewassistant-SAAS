import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, Building, ArrowLeft, FileText, Settings as SettingsIcon, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    if (!SUPER_ADMIN_EMAILS.includes(user.email)) {
        redirect("/dashboard");
    }

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50/50">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 border-r bg-white flex flex-col">
                <div className="h-16 flex items-center px-6 border-b">
                    <span className="font-bold text-lg text-primary">SaaS Admin Portal</span>
                </div>
                <div className="flex-1 py-4 flex flex-col gap-1 px-4">
                    <Link href="/superadmin">
                        <Button variant="ghost" className="w-full justify-start gap-3">
                            <LayoutDashboard className="h-4 w-4 justify-start shrink-0" /> <span className="truncate">Overview</span>
                        </Button>
                    </Link>
                    <Link href="/superadmin/businesses">
                        <Button variant="ghost" className="w-full justify-start gap-3">
                            <Building className="h-4 w-4 justify-start shrink-0" /> <span className="truncate">Businesses</span>
                        </Button>
                    </Link>
                    <Link href="/superadmin/users">
                        <Button variant="ghost" className="w-full justify-start gap-3">
                            <Users className="h-4 w-4 justify-start shrink-0" /> <span className="truncate">All Users</span>
                        </Button>
                    </Link>
                    <Link href="/superadmin/pages">
                        <Button variant="ghost" className="w-full justify-start gap-3 text-purple-700 hover:text-purple-800 hover:bg-purple-50">
                            <FileText className="h-4 w-4 justify-start shrink-0" /> <span className="truncate">Legal Pages</span>
                        </Button>
                    </Link>
                    <Link href="/superadmin/pricing">
                        <Button variant="ghost" className="w-full justify-start gap-3 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50">
                            <CreditCard className="h-4 w-4 justify-start shrink-0" /> <span className="truncate">Pricing Plans</span>
                        </Button>
                    </Link>
                </div>

                <div className="p-4 border-t space-y-1">
                    <Link href="/superadmin/settings">
                        <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground">
                            <SettingsIcon className="h-4 w-4 justify-start shrink-0" /> <span className="truncate">Profile Settings</span>
                        </Button>
                    </Link>
                    <Link href="/dashboard">
                        <Button variant="outline" className="w-full gap-2 text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="h-4 w-4" /> Exit Setup
                        </Button>
                    </Link>
                </div>
            </aside>

            {/* Content Area */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
