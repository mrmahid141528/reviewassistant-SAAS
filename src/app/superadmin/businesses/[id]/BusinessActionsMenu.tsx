"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban, Download, Trash, MoreHorizontal, CheckCircle2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toggleBusinessSuspendState } from "./settings/actions";
import { adminDeleteBusiness, exportBusinessData } from "./actions";

export function BusinessActionsMenu({ businessId, isSuspended }: { businessId: string, isSuspended: boolean }) {
    const [alertState, setAlertState] = useState<'none' | 'suspend' | 'delete'>('none');
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleSuspend = () => {
        startTransition(async () => {
            const res = await toggleBusinessSuspendState(businessId, isSuspended ? "suspended" : "active", "mrmahid141528@gmail.com");
            if (res.success) {
                setAlertState('none');
            } else {
                alert("Error: " + res.error);
            }
        });
    }

    const handleDelete = () => {
        startTransition(async () => {
            const res = await adminDeleteBusiness(businessId);
            if (res.success) {
                setAlertState('none');
                router.push('/superadmin/businesses');
            } else {
                alert("Error deletion failed: " + res.error);
            }
        });
    }

    const handleExport = async () => {
        const res = await exportBusinessData(businessId);
        if (res.success && res.data) {
            const b = res.data;
            const headers = [
                "Business ID", "Business Name", "Slug", "Status", "Email", "Phone", "Timezone",
                "Created At", "Current Plan", "Subscription Status", "Total Locations", "Total Members",
                "Total Campaigns", "Total Customers"
            ];

            const activeSub = b.subscriptions?.find((s: any) => s.status === 'active' || s.status === 'trialing');
            const planName = activeSub?.plan?.name || "None";
            const subStatus = activeSub?.status || "None";

            const escapeCsv = (str: any) => `"${String(str || '').replace(/"/g, '""')}"`;

            const row = [
                b.id,
                escapeCsv(b.name),
                b.slug,
                b.status,
                b.email || "",
                b.phone || "",
                b.timezone || "",
                b.createdAt,
                escapeCsv(planName),
                subStatus,
                b.locations?.length || 0,
                b.members?.length || 0,
                b.campaigns?.length || 0,
                b.customers?.length || 0
            ];

            const csvContent = headers.join(",") + "\n" + row.join(",");
            const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
            const anchor = document.createElement('a');
            anchor.setAttribute("href", dataStr);
            anchor.setAttribute("download", `tenant_${businessId}_export.csv`);
            anchor.click();
        } else {
            alert("Export failed: " + res.error);
        }
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 w-9 border-slate-200">
                    <MoreHorizontal className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuGroup>
                        <DropdownMenuLabel>Business Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setAlertState('suspend')} className="text-amber-600 focus:bg-amber-50 focus:text-amber-700 cursor-pointer">
                            {isSuspended ? <CheckCircle2 className="h-4 w-4 mr-2" /> : <Ban className="h-4 w-4 mr-2" />}
                            {isSuspended ? "Reactivate Business" : "Suspend Business"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleExport} className="cursor-pointer">
                            <Download className="h-4 w-4 mr-2" />
                            Export Data
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setAlertState('delete')} className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer">
                            <Trash className="h-4 w-4 mr-2" />
                            Delete Business
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Suspend Confirmation */}
            <Dialog open={alertState === 'suspend'} onOpenChange={(v: boolean) => !v && setAlertState('none')}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isSuspended ? 'Reactivate Tenant?' : 'Suspend Tenant?'}</DialogTitle>
                        <DialogDescription>
                            {isSuspended
                                ? "This will restore the tenant's access to the platform and features immediately."
                                : "This will immediately halt all services and block the business owner from accessing the application."}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAlertState('none')} disabled={isPending}>Cancel</Button>
                        <Button onClick={(e: any) => { e.preventDefault(); handleSuspend(); }} className="bg-amber-600 hover:bg-amber-700" disabled={isPending}>
                            {isPending ? 'Processing...' : 'Confirm'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={alertState === 'delete'} onOpenChange={(v: boolean) => !v && setAlertState('none')}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Permanently Delete Tenant?</DialogTitle>
                        <DialogDescription className="text-red-600">
                            Warning: This action is irreversible. All locations, reviews, AI campaigns, users, coupons, and billing records associated with this tenant will be permanently wiped from the database.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAlertState('none')} disabled={isPending}>Cancel</Button>
                        <Button onClick={(e: any) => { e.preventDefault(); handleDelete(); }} className="bg-red-600 hover:bg-red-700 text-white" disabled={isPending}>
                            {isPending ? 'Deleting...' : 'Permanent Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
