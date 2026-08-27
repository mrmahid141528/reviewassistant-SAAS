import prisma from "@/lib/prisma";
import { toggleBusinessStatus, deleteBusiness, assignBusinessPlan } from "../actions";
import { AdminActionButtons } from "../components/AdminActionButtons";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ExternalLink, Filter, Building, User, Target, Search } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const dynamic = "force-dynamic";

export default async function SuperAdminBusinesses(props: { searchParams?: Promise<{ q?: string, status?: string }> }) {
    const searchParams = props.searchParams ? await props.searchParams : {};
    const sq = searchParams.q || "";
    const status = searchParams.status || "";

    const whereClause: any = {};
    if (sq) {
        whereClause.OR = [
            { name: { contains: sq, mode: 'insensitive' as const } },
            { slug: { contains: sq, mode: 'insensitive' as const } }
        ];
    }
    if (status) {
        whereClause.status = status;
    }

    // Advanced relational pull
    const businesses = await prisma.business.findMany({
        where: whereClause,
        include: {
            members: {
                include: { user: true }
            },
            _count: {
                select: {
                    feedbackSubmissions: true,
                    campaigns: true,
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    const rawPlans = await prisma.plan.findMany({
        where: { status: 'active' },
        orderBy: { priceMonthly: 'asc' }
    });

    const activePlans = rawPlans.map(plan => ({
        ...plan,
        priceMonthly: Number(plan.priceMonthly),
        priceYearly: plan.priceYearly ? Number(plan.priceYearly) : null
    }));

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Business Tenants</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Manage all SaaS customers, monitor utilization, and control access.</p>
                </div>
            </div>

            <Card className="shadow-sm border-slate-200">
                <CardHeader className="py-4 border-b bg-slate-50/50 flex flex-row items-center justify-between">
                    <form action="/superadmin/businesses" method="GET" className="flex items-center space-x-2 w-full max-w-sm relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            key={sq}
                            name="q"
                            defaultValue={sq}
                            placeholder="Search businesses by name or ID..."
                            className="pl-9 h-9 text-[13px] w-full"
                        />
                        <input type="hidden" name="status" value={status} />
                        <button type="submit" className="hidden" />
                    </form>
                    <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-3 gap-2">
                            <Filter className="h-4 w-4" /> Filter {status && `(${status})`}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <Link href={`/superadmin/businesses?q=${sq}`}>
                                <DropdownMenuItem>All Status</DropdownMenuItem>
                            </Link>
                            <Link href={`/superadmin/businesses?q=${sq}&status=active`}>
                                <DropdownMenuItem>Active Only</DropdownMenuItem>
                            </Link>
                            <Link href={`/superadmin/businesses?q=${sq}&status=inactive`}>
                                <DropdownMenuItem>Inactive Only</DropdownMenuItem>
                            </Link>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-auto max-h-[calc(100vh-270px)] w-full block">
                        <table className="w-full text-sm text-left whitespace-nowrap">
                            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-20 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-slate-600 text-[13px]">Business Name</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600 text-[13px]">Owner / Members</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600 text-[13px]">Status</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600 text-[13px] text-right">Campaigns</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600 text-[13px] text-right">Reviews Gen</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600 text-[13px]">Created On</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600 text-[13px] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {businesses.map(b => (
                                    <tr key={b.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                                    <Building className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <Link href={`/superadmin/businesses/${b.id}`} className="font-semibold text-slate-900 hover:text-primary transition-colors flex items-center gap-1">
                                                        {b.name} <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </Link>
                                                    <p className="text-xs text-slate-500 font-mono mt-0.5">{b.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-[13px] font-medium text-slate-700 flex items-center gap-1.5">
                                                    <User className="h-3.5 w-3.5 text-slate-400" />
                                                    {b.members[0]?.user.email || "No Owner"}
                                                </span>
                                                {b.members.length > 1 && (
                                                    <span className="text-xs text-slate-400 mt-0.5">+{b.members.length - 1} other members</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase ${b.status === 'active' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                                                {b.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-slate-700">
                                            {b._count.campaigns.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="inline-flex items-center font-medium bg-purple-50 text-purple-700 px-2 py-1 rounded-md text-xs border border-purple-100">
                                                {b._count.feedbackSubmissions.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-[13px] text-slate-500">
                                            {b.createdAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <AdminActionButtons
                                                id={b.id}
                                                currentStatus={b.status}
                                                type="business"
                                                toggleAction={toggleBusinessStatus}
                                                deleteAction={deleteBusiness}
                                                assignPlanAction={assignBusinessPlan}
                                                plans={activePlans}
                                                currentPlanId={b.razorpayPlanId}
                                            />
                                        </td>
                                    </tr>
                                ))}
                                {businesses.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-slate-500 bg-slate-50/50">
                                            <Building className="h-8 w-8 mx-auto text-slate-300 mb-3" />
                                            <p className="font-medium text-slate-600">No businesses found</p>
                                            <p className="text-sm mt-1">Tenant records will appear here.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
