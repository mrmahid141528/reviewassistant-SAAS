import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { SettingsClient } from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function SuperAdminSettings() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) return null;

    const dbUser = await prisma.user.findUnique({
        where: { email: user.email }
    });

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
                <p className="text-muted-foreground mt-1">Manage your administrative credentials and security settings.</p>
            </div>

            <SettingsClient
                initialName={dbUser?.name || ""}
                email={user.email}
            />
        </div>
    );
}
