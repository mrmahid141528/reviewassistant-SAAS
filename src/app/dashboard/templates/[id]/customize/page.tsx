import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CanvasEditorClient } from "./CanvasEditorClient";
import { createClient } from "@/lib/supabase/server";

export default async function TemplateCustomizePage({ params }: { params: { id: string } }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return notFound();

    // Fetch template
    const template = await prisma.designTemplate.findUnique({
        where: { id: params.id }
    });

    if (!template) return notFound();

    // Fetch user's business context (for logo/name integration)
    const members = await prisma.businessMember.findMany({
        where: { userId: user.id },
        include: { business: true }
    });

    if (members.length === 0) return notFound();
    const activeBusiness = members[0].business;

    // Fetch campaigns for QR mapping
    const campaigns = await prisma.campaign.findMany({
        where: { businessId: activeBusiness.id, status: "active" }
    });

    return (
        <CanvasEditorClient
            template={template}
            business={activeBusiness}
            campaigns={campaigns}
        />
    );
}
