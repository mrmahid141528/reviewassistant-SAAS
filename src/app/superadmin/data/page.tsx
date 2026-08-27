import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Database, HardDrive, DatabaseZap, Download, Trash2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SuperAdminDataPage() {
    let dbSizeFormatted = "Unknown";
    let latency = 0;
    let activeTenants = 0;

    try {
        const start = Date.now();
        await prisma.$queryRaw`SELECT 1`;
        latency = Date.now() - start;

        const sizeResult: any = await prisma.$queryRaw`SELECT pg_size_pretty(pg_database_size(current_database())) as size`;
        if (sizeResult && sizeResult.length > 0 && sizeResult[0].size) {
            dbSizeFormatted = sizeResult[0].size;
        } else if (sizeResult && sizeResult[0] && typeof sizeResult[0] === 'object' && 'size' in sizeResult[0]) {
            // Prisma returns objects mapping depending on the driver
            dbSizeFormatted = sizeResult[0].size;
        }

        activeTenants = await prisma.business.count({ where: { status: 'active' } });
    } catch (e) {
        console.error("Failed to fetch DB metrics:", e);
    }

    // Split size into value and unit if possible (e.g., "14 MB" -> "14", "MB")
    let sizeVol = "0";
    let sizeUnit = "B";
    if (dbSizeFormatted !== "Unknown") {
        const parts = dbSizeFormatted.split(' ');
        if (parts.length === 2) {
            sizeVol = parts[0];
            sizeUnit = parts[1];
        } else {
            sizeVol = dbSizeFormatted;
            sizeUnit = "DATA";
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Data Control Center</h1>
                <p className="text-muted-foreground mt-1">Raw database management, bulk data exports, and infrastructure health monitoring.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Postgres Health */}
                <Card className="lg:col-span-2 shadow-sm border-slate-200">
                    <CardHeader className="border-b bg-slate-50/50">
                        <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                            <Database className="h-5 w-5 text-indigo-500" /> PostgreSQL Infrastructure
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">Live database performance metrics and connection pools.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 flex flex-col justify-center">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Storage Used</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1 flex items-end gap-1">{sizeVol} <span className="text-sm font-medium text-slate-500 mb-1">{sizeUnit}</span></p>
                            </div>
                            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 flex flex-col justify-center">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Query Latency</p>
                                <p className="text-2xl font-bold text-emerald-600 mt-1 flex items-end gap-1">{latency} <span className="text-sm font-medium text-emerald-600/70 mb-1">ms avg</span></p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-600 font-medium">Active Tenants (Live Table Rows)</span>
                                <span className="text-slate-900 font-bold">{activeTenants} / 100 max</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${Math.min((activeTenants / 100) * 100, 100)}%` }}></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Exfiltration & Recovery Controls */}
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="border-b bg-slate-50/50">
                        <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                            <HardDrive className="h-5 w-5 text-slate-500" /> Export & Recovery
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <Button className="w-full justify-start gap-3 h-12 bg-slate-900 rounded-lg hover:bg-slate-800 opacity-50 cursor-not-allowed">
                            <Download className="h-4 w-4 text-emerald-400" />
                            <div className="text-left">
                                <div className="font-semibold text-sm text-white">Full Postgres Dump Export</div>
                                <div className="text-[10px] text-slate-400">Not enabled in this environment.</div>
                            </div>
                        </Button>
                        <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-lg border-slate-200 opacity-50 cursor-not-allowed">
                            <DatabaseZap className="h-4 w-4 text-blue-500" />
                            <div className="text-left">
                                <div className="font-semibold text-sm text-slate-900">Trigger Manual Backup</div>
                                <div className="text-[10px] text-slate-500">Requires internal CLI access.</div>
                            </div>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Danger Zone */}
            <Card className="border-rose-200 shadow-sm">
                <CardHeader className="border-b border-rose-100 bg-rose-50/30">
                    <CardTitle className="text-lg text-rose-800 flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5 text-rose-600" /> Danger Zone
                    </CardTitle>
                    <CardDescription className="text-rose-600/80">Irreversible destructive actions affecting the global platform.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 bg-white space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 border border-rose-100 rounded-xl bg-orange-50/30">
                        <div>
                            <h4 className="font-bold text-slate-900 text-sm">Purge Orphaned Records</h4>
                            <p className="text-xs text-slate-500 mt-1 max-w-sm">Permanently deletes data belonging to deleted tenants (soft-delete cleanup).</p>
                        </div>
                        <Button variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 bg-white" disabled>
                            <Trash2 className="h-4 w-4 mr-2" /> Execute Purge
                        </Button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 border border-rose-100 rounded-xl bg-rose-50/50">
                        <div>
                            <h4 className="font-bold text-rose-900 text-sm">Wipe ALL Tenant Data</h4>
                            <p className="text-xs text-rose-700 mt-1 max-w-sm">Wipes all business data, users, and campaigns securely. Retains Superadmin configs.</p>
                        </div>
                        <Button variant="destructive" className="bg-rose-600 hover:bg-rose-700 text-white shadow-xl" disabled>
                            Factory Reset SaaS
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
