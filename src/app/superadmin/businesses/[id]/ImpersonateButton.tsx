"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MonitorPlay, ShieldAlert, AlertTriangle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { startImpersonation } from "../../actions";

export function ImpersonateButton({ businessId, businessName }: { businessId: string, businessName: string }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleImpersonate = async () => {
        setLoading(true);
        try {
            const redirectUrl = await startImpersonation(businessId);
            window.location.href = redirectUrl;
        } catch (error: any) {
            alert(error.message || "Failed to start impersonation.");
            setLoading(false);
            setOpen(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-slate-900 text-white shadow hover:bg-slate-900/90 h-9 px-4 py-2 gap-2 shadow-sm rounded-md">
                <MonitorPlay className="h-4 w-4" /> Impersonate
            </DialogTrigger>
            <DialogContent className="sm:max-w-md border-rose-200">
                <DialogHeader className="pt-2">
                    <div className="mx-auto w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mb-4 border border-rose-200">
                        <ShieldAlert className="h-6 w-6 text-rose-600" />
                    </div>
                    <DialogTitle className="text-center text-xl">Impersonate Tenant</DialogTitle>
                    <DialogDescription className="text-center pt-2 text-slate-600">
                        You are about to securely masquerade as <strong>{businessName}</strong>.
                        Every action taken during this session will be logged persistently in the Superadmin Audit Trail.
                    </DialogDescription>
                </DialogHeader>
                <div className="bg-rose-50 border border-dashed border-rose-200 rounded-md p-3 my-2 flex gap-3 text-rose-800 text-sm">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <p>
                        Your IP address, timestamp, and actions will be strictly recorded for SOC 2 compliance. Proceed with caution.
                    </p>
                </div>
                <DialogFooter className="sm:justify-between mt-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleImpersonate} disabled={loading} className="gap-2">
                        {loading ? "Authenticating..." : (
                            <>
                                <MonitorPlay className="h-4 w-4" /> Start Impersonation
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
