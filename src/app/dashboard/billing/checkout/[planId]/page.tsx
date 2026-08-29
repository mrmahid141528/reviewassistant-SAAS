import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import CheckoutClient from "./CheckoutClient"
import { getBillingConfig } from "@/app/superadmin/billing/actions"

export default async function CheckoutPage({
    params,
    searchParams
}: {
    params: Promise<{ planId: string }>,
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const p = await params;
    const sp = await searchParams;
    const planId = p.planId;
    const cycle = sp.cycle as 'monthly' | 'yearly' || 'monthly';

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const membership = await prisma.businessMember.findFirst({
        where: { userId: user.id },
        include: { business: true }
    });

    if (!membership) redirect("/dashboard");

    const plan = await prisma.plan.findUnique({
        where: { id: planId }
    });

    if (!plan) redirect("/dashboard/billing/plans");

    // Map necessary fields for Server Action serialization rules to bypass Decimal boundaries
    const serializedPlan = {
        id: plan.id,
        name: plan.name,
        slug: plan.slug,
        priceMonthly: Number(plan.priceMonthly),
        priceYearly: Number(plan.priceYearly),
    }

    const config = await getBillingConfig()
    const billingConfig = ('error' in config) ? { whatsappNumber: "", gstPercentage: 18 } : config

    return (
        <div className="container max-w-4xl pt-8 pb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <CheckoutClient
                plan={serializedPlan}
                cycle={cycle}
                businessId={membership.businessId}
                businessName={membership.business.name}
                billingConfig={billingConfig}
            />
        </div>
    )
}
