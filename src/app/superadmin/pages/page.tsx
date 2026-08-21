import prisma from "@/lib/prisma";
import { CMSClient } from "./CMSClient";

export const dynamic = "force-dynamic";

export default async function SuperAdminPages() {
    const pages = await prisma.legalPage.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Legal Pages CMS</h1>
                <p className="text-muted-foreground mt-1">Manage public documents like Privacy Policy and Terms of Service.</p>
            </div>

            <CMSClient initialPages={pages} />
        </div>
    );
}
