import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { QrCode, Building, ExternalLink, Filter, Search, MapPin, Target } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Global QR Campaigns | SaaS Control",
};

export default async function SuperadminCampaignsPage() {
    const campaigns = await prisma.campaign.findMany({
        include: {
            business: true,
            location: true,
            _count: {
                select: {
                    feedbackSubmissions: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Platform QR Campaigns</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Monitor all active review campaigns across tenants and locations.</p>
                </div>
            </div>

            <Card className="shadow-sm border-slate-200">
                <CardHeader className="py-4 border-b bg-slate-50/50 flex flex-row items-center justify-between">
                    <div className="flex items-center space-x-2 w-full max-w-sm relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input placeholder="Search campaigns by name..." className="pl-9 h-9 text-[13px] w-full" />
                    </div>
                    <Button variant="outline" size="sm" className="h-9 gap-2">
                        <Filter className="h-4 w-4" /> Filter
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left whitespace-nowrap">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-slate-600 text-[13px]">Campaign Name</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600 text-[13px]">Tenant / Location</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600 text-[13px]">Status</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600 text-[13px]">Platform</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600 text-[13px] text-right">Submissions</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600 text-[13px]">Created On</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {campaigns.map(c => (
                                    <tr key={c.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                                                    <QrCode className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-slate-900 flex items-center gap-1">
                                                        {c.name}
                                                    </span>
                                                    <p className="text-xs text-slate-500 font-mono mt-0.5">{c.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <Link href={`/superadmin/businesses/${c.businessId}`} className="text-[13px] font-semibold tracking-tight text-slate-700 hover:text-primary transition-colors flex items-center gap-1.5 w-fit">
                                                    <Building className="h-3.5 w-3.5 text-slate-400" />
                                                    {c.business.name} <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </Link>
                                                {c.location ? (
                                                    <span className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                                        <MapPin className="h-3 w-3 text-slate-400" /> {c.location.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-400 mt-0.5 flex items-center gap-1 italic">
                                                        Global Campaign
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase ${c.status === 'active' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 capitalize text-slate-600 font-medium">
                                                {c.reviewPlatform}
                                                <span className="text-[11px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                                                    ≥ {c.ratingThreshold}★
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="inline-flex items-center font-medium bg-purple-50 text-purple-700 px-2 py-1 rounded-md text-xs border border-purple-100">
                                                {c._count.feedbackSubmissions.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-[13px] text-slate-500">
                                            {c.createdAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                    </tr>
                                ))}
                                {campaigns.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500 bg-slate-50/50">
                                            <QrCode className="h-8 w-8 mx-auto text-slate-300 mb-3" />
                                            <p className="font-medium text-slate-600">No campaigns found</p>
                                            <p className="text-sm mt-1">Tenant campaigns will appear here.</p>
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
