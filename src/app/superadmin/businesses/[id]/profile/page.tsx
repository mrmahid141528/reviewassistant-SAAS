import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Building } from "lucide-react";

export default async function BusinessProfileTab(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;

    const business = await prisma.business.findUnique({
        where: { id },
        include: {
            locations: true
        }
    });

    if (!business) notFound();

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            <div>
                <h2 className="text-xl font-bold text-slate-900">Business Profile</h2>
                <p className="text-sm text-muted-foreground mt-1">View the basic information and configuration for this tenant.</p>
            </div>

            <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50 border-b">
                    <CardTitle className="text-lg">Core Details</CardTitle>
                </CardHeader>
                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-1.5">
                        <Label className="text-slate-500 text-xs uppercase tracking-wider">Business Name</Label>
                        <p className="font-medium text-slate-900">{business.name}</p>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-slate-500 text-xs uppercase tracking-wider">Unique Slug</Label>
                        <p className="font-medium font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md w-max border border-slate-200">{business.slug}</p>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-slate-500 text-xs uppercase tracking-wider">Primary Email</Label>
                        <p className="text-slate-900">{business.email || "Not provided"}</p>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-slate-500 text-xs uppercase tracking-wider">Phone Number</Label>
                        <p className="text-slate-900">{business.phone || "Not provided"}</p>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-slate-500 text-xs uppercase tracking-wider">Website URL</Label>
                        <div className="flex items-center gap-2">
                            <p className="text-slate-900 truncate max-w-[200px]">{business.websiteUrl || "Not provided"}</p>
                            {business.websiteUrl && (
                                <a href={business.websiteUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1 text-xs">
                                    Visit
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            )}
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-slate-500 text-xs uppercase tracking-wider">Status</Label>
                        <div>
                            <Badge variant={business.status === 'active' ? 'default' : 'secondary'} className={business.status === 'active' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' : ''}>
                                {business.status.toUpperCase()}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50 border-b">
                    <CardTitle className="text-lg">Locations ({business.locations.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-slate-100">
                        {business.locations.map(loc => (
                            <div key={loc.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                                        <Building className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-slate-900">{loc.name}</p>
                                            {loc.isMain && <Badge variant="outline" className="text-[10px] uppercase bg-slate-50 text-slate-500 border-slate-200 px-1.5 h-5">Main</Badge>}
                                        </div>
                                        <p className="text-sm text-slate-500">{loc.address || "No address specified"}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-500">Place ID</p>
                                    <p className="text-sm font-mono text-slate-700">{loc.googlePlaceId || "Not linked"}</p>
                                </div>
                            </div>
                        ))}
                        {business.locations.length === 0 && (
                            <div className="p-8 text-center text-slate-500">
                                No locations registered yet.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
