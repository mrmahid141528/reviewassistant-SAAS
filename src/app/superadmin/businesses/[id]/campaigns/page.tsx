import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QrCode, MessageSquareShare } from "lucide-react";
import Link from "next/link";

export default async function BusinessCampaignsTab(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;

    const campaigns = await prisma.campaign.findMany({
        where: { businessId: id },
        include: {
            location: true,
            _count: {
                select: { feedbackSubmissions: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    if (!campaigns) notFound();

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">QR Campaigns</h2>
                    <p className="text-sm text-muted-foreground mt-1">Review collection campaigns and their conversion metrics.</p>
                </div>
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Total: {campaigns.length} Active
                </Badge>
            </div>

            <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50 border-b">
                    <CardTitle className="text-lg">Campaign Ledger</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 font-medium text-slate-500">Campaign Details</th>
                                    <th className="px-6 py-4 font-medium text-slate-500">Location</th>
                                    <th className="px-6 py-4 font-medium text-slate-500 text-center">Platform</th>
                                    <th className="px-6 py-4 font-medium text-slate-500 text-right">Submissions</th>
                                    <th className="px-6 py-4 font-medium text-slate-500 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {campaigns.map(campaign => (
                                    <tr key={campaign.id} className="hover:bg-slate-50/50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                                                    <QrCode className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900">{campaign.name}</p>
                                                    <p className="text-xs text-slate-500 font-mono mt-0.5">{campaign.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 font-medium">
                                            {campaign.location?.name || "All Locations"}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Badge variant="outline" className="capitalize text-[11px] font-semibold">{campaign.reviewPlatform}</Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="inline-flex items-center gap-1.5 font-medium bg-slate-50 px-2.5 py-1 text-slate-700 rounded-md border border-slate-200">
                                                <MessageSquareShare className="h-3.5 w-3.5 text-slate-400" />
                                                {campaign._count.feedbackSubmissions}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Badge variant="default" className={campaign.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}>
                                                {campaign.status}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                                {campaigns.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                            <QrCode className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                                            No campaigns created by this business yet.
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
