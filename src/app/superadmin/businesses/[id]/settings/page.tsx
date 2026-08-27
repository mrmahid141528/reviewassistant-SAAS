import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Building, Settings, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { updateBusinessDetails } from "../../../actions";

export const dynamic = "force-dynamic";

export default async function TenantSettingsPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;

    const business = await prisma.business.findUnique({
        where: { id: params.id }
    });

    if (!business) {
        notFound();
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Link href={`/superadmin/businesses/${business.id}`}>
                        <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-full border-slate-200 shadow-sm">
                            <ArrowLeft className="h-4 w-4 text-slate-500" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                            Tenant Settings
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">Force overrides for {business.name}.</p>
                    </div>
                </div>
            </div>

            <Card className="shadow-sm border-slate-200">
                <CardHeader className="border-b bg-slate-50/50">
                    <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
                        <Building className="h-5 w-5 text-slate-500" /> Tenant Configuration
                    </CardTitle>
                    <CardDescription>Modify crucial business routing details and metadata.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <form action={async (formData) => {
                        "use server"
                        await updateBusinessDetails(formData);
                        redirect(`/superadmin/businesses/${business.id}`);
                    }} className="space-y-6">
                        <input type="hidden" name="businessId" value={business.id} />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Business Name</Label>
                                <Input id="name" name="name" defaultValue={business.name} required className="h-10 border-slate-200 bg-slate-50/50" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="slug">Project Slug (URL Routing)</Label>
                                <Input id="slug" name="slug" defaultValue={business.slug} required className="h-10 border-slate-200 bg-slate-50/50 font-mono text-sm" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Industry Category</Label>
                                <Input id="category" name="category" defaultValue={business.category || ""} placeholder="e.g. Retail, Medical" className="h-10 border-slate-200 bg-slate-50/50" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="timezone">Timezone</Label>
                                <Input id="timezone" name="timezone" defaultValue={business.timezone || ""} placeholder="e.g. Asia/Kolkata" className="h-10 border-slate-200 bg-slate-50/50" />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100 flex justify-end">
                            <Button type="submit" className="bg-slate-900 text-white gap-2 h-10 px-6">
                                <Save className="h-4 w-4" /> Save Overrides
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
