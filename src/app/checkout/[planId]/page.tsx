import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import CheckoutClient from "./CheckoutClient"
import { getBillingConfig } from "@/app/superadmin/billing/actions"
import { getBrandSettings } from "@/lib/brand"
import { Star } from "lucide-react"

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
        include: {
            business: {
                include: { locations: true }
            }
        }
    });

    const dbUser = await prisma.user.findUnique({
        where: { id: user.id }
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

    const allPlans = await prisma.plan.findMany({
        where: { status: 'active', name: { not: 'Superadmin Override Trial' } },
        orderBy: { priceMonthly: 'asc' }
    });

    const serializedPlans = allPlans.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        priceMonthly: Number(p.priceMonthly),
        priceYearly: Number(p.priceYearly),
    }));

    const brandSettings = await getBrandSettings();
    const config = await getBillingConfig()
    const billingConfig = ('error' in config) ? { whatsappNumber: "", gstPercentage: 18 } : config

    // Extract billing info if already exists
    const settings = membership.business.settings as any;
    const initialBillingInfo = {
        billingName: settings?.billing?.billingName || membership.business.name || "",
        billingEmail: settings?.billing?.billingEmail || membership.business.email || dbUser?.email || user.email || "",
        billingPhone: settings?.billing?.billingPhone || membership.business.phone || "",
        ownerName: dbUser?.name || "",
        ownerEmail: dbUser?.email || user.email || "",
        ownerDesignation: "Owner / Manager",
        gstin: settings?.billing?.gstin || "",
        streetAddress: settings?.billing?.streetAddress || membership.business.locations?.[0]?.address || "",
        city: settings?.billing?.city || membership.business.locations?.[0]?.city || "",
        state: settings?.billing?.state || membership.business.locations?.[0]?.state || "",
        pinCode: settings?.billing?.pinCode || membership.business.locations?.[0]?.postalCode || "",
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#f8fafc] text-foreground font-sans">
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-white/70 backdrop-blur-xl shadow-sm">
                <div className="max-w-[1400px] w-full mx-auto flex h-[72px] items-center px-4 md:px-8">
                    <div className="flex items-center gap-3">
                        {brandSettings?.logoUrl ? (
                            <img src={brandSettings.logoUrl} alt="Platform Logo" className="h-9 w-auto object-contain drop-shadow-sm" />
                        ) : (
                            <>
                                <Star className="h-7 w-7 text-primary fill-primary" />
                                <span className="font-bold tracking-tight text-xl">{brandSettings?.platformName || 'Smart Review Assistant'}</span>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1 w-full max-w-[1400px] mx-auto pt-6 pb-6 px-4 md:px-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <CheckoutClient
                    plan={serializedPlan}
                    plans={serializedPlans}
                    cycle={cycle}
                    businessId={membership.businessId}
                    businessName={membership.business.name}
                    billingConfig={billingConfig}
                    initialBillingInfo={initialBillingInfo}
                />
            </main>
        </div>
    )
}
