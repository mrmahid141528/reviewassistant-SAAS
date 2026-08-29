import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Database } from "lucide-react";
import prisma from "@/lib/prisma";
import { DataControlsClient } from "./DataControlsClient";

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
                <div className="lg:col-span-1">
                    {/* The client-side controls are grouped here */}
                    <DataControlsClient />
                </div>
            </div>
        </div>
    );
}
