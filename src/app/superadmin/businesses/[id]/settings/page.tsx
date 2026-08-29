import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { SettingsClient } from "./SettingsClient";

export default async function BusinessSettingsTab(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;

    const business = await prisma.business.findUnique({
        where: { id }
    });

    if (!business) notFound();

    // Use a fixed superadmin email as placeholder or extract from auth context
    const superAdminEmail = "mrmahid141528@gmail.com";

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            <div>
                <h2 className="text-xl font-bold text-slate-900">Settings & Overrides</h2>
                <p className="text-sm text-muted-foreground mt-1">Master controls for tenant configuration and manual administrative overrides.</p>
            </div>

            <SettingsClient
                businessId={id}
                currentStatus={business.status}
                superAdminEmail={superAdminEmail}
            />
        </div>
    );
}
