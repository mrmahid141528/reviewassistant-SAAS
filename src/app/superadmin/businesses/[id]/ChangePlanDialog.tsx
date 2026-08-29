'use client';

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminAssignPlan } from "./actions";

export function ChangePlanDialog({
    businessId,
    plans,
    currentPlanName
}: {
    businessId: string;
    plans: { id: string, name: string, priceMonthly: number }[];
    currentPlanName: string;
}) {
    const [open, setOpen] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState<string>("");
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleAssign = () => {
        if (!selectedPlanId) return;

        startTransition(async () => {
            const res = await adminAssignPlan(businessId, selectedPlanId);
            if (res.success) {
                setMessage({ type: 'success', text: 'Plan assigned successfully!' });
                setTimeout(() => {
                    setOpen(false);
                    setMessage(null);
                }, 2000);
            } else {
                setMessage({ type: 'error', text: res.error || 'Failed to assign plan' });
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) setMessage(null); }}>
            <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 border-slate-200">
                Change Plan
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Assign Core Plan</DialogTitle>
                    <DialogDescription>
                        Manually change the tenant's current plan ({currentPlanName}) to one of the standard core plans.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {message && (
                        <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                            {message.text}
                        </div>
                    )}
                    <Select value={selectedPlanId} onValueChange={(val: any) => setSelectedPlanId(val || "")}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a plan" />
                        </SelectTrigger>
                        <SelectContent>
                            {plans.map(plan => (
                                <SelectItem key={plan.id} value={plan.id}>
                                    {plan.name} (₹{plan.priceMonthly}/mo)
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button onClick={handleAssign} disabled={isPending || !selectedPlanId} className="w-full">
                        {isPending ? 'Processing...' : 'Assign Plan'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
