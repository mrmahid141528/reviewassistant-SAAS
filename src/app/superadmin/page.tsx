import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Building, MessageSquare, Target } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SuperAdminDashboard() {
    const totalUsers = await prisma.user.count();
    const totalBusinesses = await prisma.business.count();
    const totalCampaigns = await prisma.campaign.count();
    const totalSubmissions = await prisma.feedbackSubmission.count();

    const recentBusinesses = await prisma.business.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>
                <p className="text-muted-foreground mt-1">Platform-wide statistics and recent activity for Review Assistant.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total SaaS Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalUsers}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Business Tenants</CardTitle>
                        <Building className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalBusinesses}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Active QR Campaigns</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalCampaigns}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Feedback Delivered</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalSubmissions}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Businesses Created</CardTitle>
                    <CardDescription>The newest registered tenants on the platform</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentBusinesses.map((b) => (
                            <div key={b.id} className="flex items-center justify-between border-b pb-4 last:pb-0 last:border-0">
                                <div className="space-y-1">
                                    <p className="font-medium text-sm leading-none">{b.name}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Slug: {b.slug}</p>
                                </div>
                                <div className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                                    {b.createdAt.toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                        {recentBusinesses.length === 0 && (
                            <div className="text-sm text-muted-foreground py-8 text-center bg-muted/20 border border-dashed rounded-lg">No businesses created yet.</div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
