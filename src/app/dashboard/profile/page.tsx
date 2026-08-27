import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { ProfileForm } from "./ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let dbUser = null;
    if (user?.id) {
        dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    }

    return (
        <div className="space-y-8 max-w-4xl pb-10">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
                <p className="text-muted-foreground mt-1">
                    Manage your personal information and account preferences.
                </p>
            </div>

            <ProfileForm dbUser={dbUser} authUser={user} />
        </div>
    );
}
