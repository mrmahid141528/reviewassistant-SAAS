import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Activity, ShieldAlert, CheckCircle2, AlertCircle } from "lucide-react";
import prisma from "@/lib/prisma";

export default async function BusinessAuditTab(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;

    const business = await prisma.business.findUnique({
        where: { id }
    });

    if (!business) notFound();

    const auditLogs = await prisma.auditLog.findMany({
        where: { businessId: id },
        orderBy: { createdAt: 'desc' },
        take: 50
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            <div>
                <h2 className="text-xl font-bold text-slate-900">Activity & Audit Logs</h2>
                <p className="text-sm text-muted-foreground mt-1">Immutable security tracking and master operation ledger.</p>
            </div>

            <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50 border-b">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Activity className="h-5 w-5 text-slate-500" /> Administrative Ledger
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                        {auditLogs.length > 0 ? (
                            auditLogs.map(log => (
                                <div key={log.id} className="p-4 hover:bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex gap-4 items-start">
                                        <div className="mt-1 shrink-0">
                                            {log.result === 'success' ? (
                                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                            ) : log.result === 'warning' ? (
                                                <AlertCircle className="h-5 w-5 text-amber-500" />
                                            ) : (
                                                <ShieldAlert className="h-5 w-5 text-rose-500" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">{log.action.replace(/_/g, ' ')}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{log.description || "System action recorded"}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="inline-flex items-center rounded-sm bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 uppercase tracking-wider">
                                                    {log.actorType}
                                                </span>
                                                <span className="text-[11px] text-slate-400 font-mono">
                                                    ID: {log.traceId.slice(0, 12)}...
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <p className="text-xs text-slate-500 font-mono">
                                            {log.createdAt.toLocaleDateString()} {log.createdAt.toLocaleTimeString()}
                                        </p>
                                        <p className="text-[11px] text-slate-400 mt-1 truncate max-w-[200px]">
                                            By: {log.actorId || "System"}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-20 text-center">
                                <Activity className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                                <h3 className="text-lg font-medium text-slate-700">Audit Trail Active</h3>
                                <p className="text-slate-500 mt-1 max-w-md mx-auto text-sm">No critical master actions have been performed on this tenant yet.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
