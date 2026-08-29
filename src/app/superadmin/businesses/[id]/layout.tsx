import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Building, MoreHorizontal, Ban, Trash, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ImpersonateButton } from "./ImpersonateButton";
import { BusinessNav } from "./BusinessNav";
import { ChangePlanDialog } from "./ChangePlanDialog";
import { BusinessActionsMenu } from "./BusinessActionsMenu";
import Link from "next/link";

export default async function BusinessDetailLayout(props: { params: Promise<{ id: string }>, children: React.ReactNode }) {
    const params = await props.params;

    const business = await prisma.business.findUnique({
        where: { id: params.id },
        select: {
            id: true,
            name: true,
            slug: true,
            status: true,
            createdAt: true,
            members: {
                where: { role: 'owner' },
                include: { user: { select: { name: true, email: true } } },
                take: 1
            },
            subscriptions: {
                where: { status: 'active' },
                include: { plan: { select: { name: true } } },
                take: 1
            }
        }
    });

    if (!business) {
        notFound();
    }

    const activePlan = business.subscriptions[0]?.plan?.name || "Free";
    const owner = business.members[0]?.user;

    const dbPlans = await prisma.plan.findMany({
        where: { slug: { not: 'manual-override-trial' } },
        orderBy: { priceMonthly: 'asc' },
        select: { id: true, name: true, priceMonthly: true, status: true }
    });

    const corePlans = dbPlans.map(p => ({
        id: p.id,
        name: p.status === 'archived' ? `${p.name} (Archived)` : p.name,
        priceMonthly: Number(p.priceMonthly || 0)
    }));

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            {/* Action Bar / Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0 shadow-sm">
                        <Building className="h-7 w-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                            {business.name}
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${business.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}`}>
                                {business.status}
                            </span>
                        </h1>
                        <div className="flex items-center text-sm text-slate-500 mt-1 gap-3">
                            <span className="font-medium text-slate-700">{owner?.name || "No Owner"} • {owner?.email || "No Email"}</span>
                            <span className="text-slate-300">|</span>
                            <span className="font-semibold text-emerald-600">{activePlan} Plan</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto mt-4 md:mt-0">
                    <ImpersonateButton businessId={business.id} businessName={business.name} />

                    <ChangePlanDialog businessId={business.id} currentPlanName={activePlan} plans={corePlans} />

                    <BusinessActionsMenu businessId={business.id} isSuspended={business.status === 'suspended'} />
                </div>
            </div>

            {/* Content Area */}
            <div className="flex flex-col lg:flex-row gap-6">
                <aside className="w-full lg:w-64 shrink-0">
                    <div className="sticky top-6">
                        <BusinessNav businessId={business.id} />
                    </div>
                </aside>

                <main className="flex-1 min-w-0">
                    {props.children}
                </main>
            </div>
        </div>
    );
}
