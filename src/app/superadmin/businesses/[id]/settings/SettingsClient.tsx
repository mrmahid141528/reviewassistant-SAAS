"use client";

import { useState, useTransition } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, ShieldAlert, Activity, CheckCircle2 } from "lucide-react";
import { toggleBusinessSuspendState, forceFreeTrialAllocation } from "./actions";

export function SettingsClient({ businessId, currentStatus, superAdminEmail }: { businessId: string, currentStatus: string, superAdminEmail: string }) {
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [trialDays, setTrialDays] = useState<number>(30);
    const isSuspended = currentStatus === 'suspended' || currentStatus === 'inactive';

    const handleToggleSuspend = () => {
        if (!confirm(`Are you sure you want to ${isSuspended ? 'reactivate' : 'suspend'} this tenant?`)) return;

        startTransition(async () => {
            const res = await toggleBusinessSuspendState(businessId, currentStatus, superAdminEmail);
            if (res?.success) {
                setMessage({ type: 'success', text: `Tenant ${res.newStatus === 'active' ? 'reactivated' : 'suspended'} successfully` });
            } else {
                setMessage({ type: 'error', text: res?.error || "Action failed" });
            }
            setTimeout(() => setMessage(null), 3000);
        });
    };

    const handleForceTrial = () => {
        if (!trialDays || trialDays <= 0) return;
        if (!confirm(`This will cancel any existing subscriptions and inject a ${trialDays}-day manual trial. Proceed?`)) return;

        startTransition(async () => {
            const res = await forceFreeTrialAllocation(businessId, superAdminEmail, trialDays);
            if (res?.success) {
                setMessage({ type: 'success', text: `Manual ${res.days}-day Trial allocation was injected to this tenant's billing profile successfully.` });
            } else {
                setMessage({ type: 'error', text: res?.error || "Failed to inject trial allocation" });
            }
            setTimeout(() => setMessage(null), 4000);
        });
    };

    return (
        <div className="grid gap-6">
            <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50 border-b">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Settings className="h-5 w-5 text-slate-500" /> Platform Overrides
                    </CardTitle>
                    <CardDescription>Force behavior changes independent of tenant settings.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    {message && (
                        <div className={`p-4 mb-4 rounded-md text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                            {message.text}
                        </div>
                    )}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-slate-100 rounded-lg">
                        <div>
                            <h4 className="font-semibold text-slate-900 text-sm">Force Free Trial Allocation</h4>
                            <p className="text-xs text-slate-500 mt-1">Bypass payment gateway and insert a manual master limit for this tenant.</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <Input
                                type="number"
                                className="w-[100px] h-9"
                                placeholder="Days"
                                value={trialDays}
                                onChange={(e) => setTrialDays(parseInt(e.target.value) || 0)}
                                aria-label="Trial Duration (Days)"
                            />
                            <Button variant="outline" size="sm" onClick={handleForceTrial} disabled={isPending || trialDays <= 0}>
                                {isPending ? 'Processing...' : 'Inject'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-sm border-rose-200 overflow-hidden">
                <CardHeader className="bg-rose-50/50 border-b border-rose-100">
                    <CardTitle className="text-lg text-rose-700 flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5" /> Danger Zone
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-rose-100 rounded-lg bg-rose-50/30">
                        <div>
                            <h4 className="font-semibold text-slate-900 text-sm">
                                {isSuspended ? 'Reactivate Suspended Business' : 'Force Suspend Business'}
                            </h4>
                            <p className="text-xs text-slate-500 mt-1">
                                {isSuspended
                                    ? 'Restore access for all members to this workspace immediately.'
                                    : 'Immediately revoke access for all members associated with this tenant.'}
                            </p>
                        </div>
                        <Button
                            variant={isSuspended ? "default" : "destructive"}
                            size="sm"
                            className="shrink-0"
                            onClick={handleToggleSuspend}
                            disabled={isPending}
                        >
                            {isPending ? 'Processing...' : (isSuspended ? 'Reactivate Tenant' : 'Suspend Tenant')}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
