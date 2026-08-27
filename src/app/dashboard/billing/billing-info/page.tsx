import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { BillingInfoForm } from "./BillingInfoForm"

export default async function BillingInfoPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const membership = await prisma.businessMember.findFirst({
        where: { userId: user.id },
        include: { business: true }
    });

    if (!membership) redirect("/dashboard");

    const settings = membership.business.settings as any || {};
    const billingSettings = settings.billing || {};
    const business = membership.business;

    const initialData = {
        billingName: billingSettings.billingName || business.name,
        billingEmail: billingSettings.billingEmail || business.email || user.email,
        billingPhone: billingSettings.billingPhone || business.phone || "",
        billingAddress: billingSettings.billingAddress || "",
        billingCity: billingSettings.billingCity || "",
        billingState: billingSettings.billingState || "",
        billingPostalCode: billingSettings.billingPostalCode || "",
        billingCountry: billingSettings.billingCountry || "India",
        isGstRegistered: billingSettings.isGstRegistered || false,
        gstin: billingSettings.gstin || "",
        tradingName: billingSettings.tradingName || "",
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <h3 className="text-sm font-bold tracking-widest text-muted-foreground uppercase ml-1">BILLING INFORMATION</h3>
            <BillingInfoForm initialData={initialData} />
        </div>
    )
}
