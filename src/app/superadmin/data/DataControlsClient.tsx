"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HardDrive, DatabaseZap, Download, Trash2, ShieldAlert, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    exportDatabaseState,
    triggerCloudBackup,
    purgeOrphanedRecords,
    factoryResetSaaS
} from "./actions";

export function DataControlsClient() {
    const [isPending, startTransition] = useTransition();
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    const handleExport = async () => {
        startTransition(async () => {
            setStatusMessage("Compiling JSON snapshot...");
            const res = await exportDatabaseState();
            if (res.success && res.payload) {
                // Trigger download
                const blob = new Blob([JSON.stringify(res.payload, null, 2)], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `SaaS_Export_${Date.now()}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                setStatusMessage(null);
            } else {
                alert("Export Failed: " + res.error);
                setStatusMessage(null);
            }
        });
    };

    const handleCloudBackup = async () => {
        startTransition(async () => {
            setStatusMessage("Pushing data to Supabase Storage...");
            const res = await triggerCloudBackup();
            if (res.success) {
                alert(res.message);
            } else {
                alert("Backup Failed: " + res.error);
            }
            setStatusMessage(null);
        });
    };

    const handlePurge = async () => {
        startTransition(async () => {
            setStatusMessage("Destroying orphaned records...");
            const res = await purgeOrphanedRecords();
            if (res.success) {
                alert(res.message);
                window.location.reload();
            } else {
                alert("Purge Failed: " + res.error);
                setStatusMessage(null);
            }
        });
    };

    const handleFactoryReset = async () => {
        startTransition(async () => {
            setStatusMessage("Initiating nuclear cascade wipe...");
            const res = await factoryResetSaaS();
            if (res.success) {
                alert(res.message);
                window.location.reload();
            } else {
                alert("Reset Failed: " + res.error);
                setStatusMessage(null);
            }
        });
    };

    return (
        <div className="space-y-8 mt-6">
            {statusMessage && (
                <div className="fixed top-0 left-0 w-full z-50 bg-indigo-600 text-white text-center py-2 flex items-center justify-center gap-3 shadow-lg">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="font-medium text-sm">{statusMessage}</span>
                </div>
            )}

            <Card className="shadow-sm border-slate-200">
                <CardHeader className="border-b bg-slate-50/50">
                    <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                        <HardDrive className="h-5 w-5 text-slate-500" /> Export & Recovery
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <Button
                        onClick={handleExport}
                        disabled={isPending}
                        className="w-full justify-start gap-3 h-12 bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
                    >
                        {isPending ? <Loader2 className="h-4 w-4 text-emerald-400 animate-spin" /> : <Download className="h-4 w-4 text-emerald-400" />}
                        <div className="text-left">
                            <div className="font-semibold text-sm text-white">Full Postgres Dump Export</div>
                            <div className="text-[10px] text-slate-300">Downloads a complete JSON schema mapping.</div>
                        </div>
                    </Button>

                    <Dialog>
                        <DialogTrigger render={<Button variant="outline" disabled={isPending} className="w-full justify-start gap-3 h-12 rounded-lg border-slate-200 hover:bg-slate-50 transition-colors" />}>
                            {isPending ? <Loader2 className="h-4 w-4 text-blue-500 animate-spin" /> : <DatabaseZap className="h-4 w-4 text-blue-500" />}
                            <div className="text-left">
                                <div className="font-semibold text-sm text-slate-900">Trigger Manual Backup</div>
                                <div className="text-[10px] text-slate-500">Pushes snapshot to Supabase platform-backups bucket.</div>
                            </div>
                        </DialogTrigger>
                        <DialogContent className="border-0 shadow-lg">
                            <DialogHeader>
                                <DialogTitle>Trigger Cloud Backup</DialogTitle>
                                <DialogDescription>
                                    This will serialize the entire core database and dispatch it directly to your Supabase private bucket (`platform-backups`). It will cost bandwidth depending on scale.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <DialogClose render={<Button variant="outline" className="border-slate-200" />}>Cancel</DialogClose>
                                <DialogClose render={<Button onClick={handleCloudBackup} className="bg-blue-600 hover:bg-blue-700 text-white" />}>Acknowledge Sync</DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-rose-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
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
                            <p className="text-xs text-slate-500 mt-1 max-w-sm">Permanently deletes data belonging to intentionally deleted tenants (soft-delete cleanup).</p>
                        </div>

                        <Dialog>
                            <DialogTrigger render={<Button variant="outline" disabled={isPending} className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 bg-white shadow-sm" />}>
                                <Trash2 className="h-4 w-4 mr-2" /> Execute Purge
                            </DialogTrigger>
                            <DialogContent className="border-0 shadow-lg border-t-[6px] border-t-orange-500">
                                <DialogHeader>
                                    <DialogTitle className="text-orange-700">Confirm Record Purge</DialogTitle>
                                    <DialogDescription>
                                        This will target businesses marked as `status = 'deleted'` and permanently erase them from the volume. This process is irreversible.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <DialogClose render={<Button variant="outline" className="border-slate-200" />}>Abort</DialogClose>
                                    <DialogClose render={<Button onClick={handlePurge} className="bg-orange-600 hover:bg-orange-700 text-white" />}>Initiate Purge</DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 border border-rose-100 rounded-xl bg-rose-50/50">
                        <div>
                            <h4 className="font-bold text-rose-900 text-sm">Wipe ALL Tenant Data</h4>
                            <p className="text-xs text-rose-700 mt-1 max-w-sm">Wipes all business data, users, and campaigns securely. Retains Superadmin configs.</p>
                        </div>

                        <Dialog>
                            <DialogTrigger render={<Button variant="destructive" disabled={isPending} className="bg-rose-600 hover:bg-rose-700 text-white shadow-xl" />}>
                                Factory Reset SaaS
                            </DialogTrigger>
                            <DialogContent className="border-0 shadow-lg border-t-[6px] border-t-rose-600">
                                <DialogHeader>
                                    <DialogTitle className="text-rose-700">🚨 AUTHORIZE COMPLETE DATA WIPE</DialogTitle>
                                    <DialogDescription className="text-rose-900/80 font-medium">
                                        WARNING: You are about to initiate a global cascade delete. This will permanently erase ALL registered businesses, customers, API activity, and user accounts. Only Superadmin keys will survive. This cannot be undone unless you have a backup.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <DialogClose render={<Button variant="outline" className="border-rose-200 text-rose-700 hover:bg-rose-50" />}>Cancel Request</DialogClose>
                                    <DialogClose render={<Button onClick={handleFactoryReset} className="bg-rose-600 hover:bg-rose-700 text-white font-bold" />}>YES, IMPLODE PLATFORM</DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
