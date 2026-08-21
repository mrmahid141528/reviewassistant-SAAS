'use server'

import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function completeOnboarding(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const businessName = formData.get("businessName") as string;
    const googleUrl = formData.get("googleUrl") as string;

    if (!businessName || !googleUrl) {
        throw new Error("Business Name and Google URL are required");
    }

    // If the user somehow already has a business mapped, do not create duplicate
    const existingMembership = await prisma.businessMember.findFirst({
        where: { userId: user.id }
    });

    if (existingMembership) {
        redirect("/dashboard");
    }

    // Generate unique slug
    const baseSlug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const finalSlug = `${baseSlug}-${user.id.substring(0, 5)}`;

    // Create Business alongside the relationship Owner role
    const biz = await prisma.business.create({
        data: {
            name: businessName,
            slug: finalSlug,
            members: {
                create: {
                    userId: user.id,
                    role: "owner"
                }
            }
        }
    });

    // Create initial Campaign and embed Google URL securely within JSON settings
    await prisma.campaign.create({
        data: {
            businessId: biz.id,
            name: "Main Review Campaign",
            slug: "main-campaign",
            settings: { googleReviewUrl: googleUrl }
        }
    });

    // Successfully bootstrapped! Transfer user securely to their new admin dashboard
    redirect("/dashboard");
}
