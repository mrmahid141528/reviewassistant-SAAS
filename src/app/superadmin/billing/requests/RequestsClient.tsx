"use client"

import { useState, useTransition } from "react"
import { Check, Clock, ExternalLink, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { approvePaymentRequest } from "./actions"

export default function RequestsClient({ orders }: { orders: any[] }) {
    const [isPending, startTransition] = useTransition()
    const [processingId, setProcessingId] = useState<string | null>(null)

    const handleApprove = (orderId: string) => {
        const confirmApprove = window.confirm("Are you sure you have verified the payment on WhatsApp? This will instantly ACTIVATE their subscription.")
        if (!confirmApprove) return;

        setProcessingId(orderId)
        startTransition(async () => {
            const res = await approvePaymentRequest(orderId)
            if (res.error) {
                alert(`Approval Failed: ${res.error}`)
            } else {
                // revalidatePath triggers refresh
            }
            setProcessingId(null)
        })
    }

    return (
        <div className="space-y-6">
            {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 bg-card border rounded-2xl border-dashed">
                    <Check className="w-10 h-10 text-green-500 mb-4 bg-green-500/10 p-2 rounded-full" />
                    <h3 className="text-lg font-bold">All Caught Up!</h3>
                    <p className="text-muted-foreground text-sm">There are no pending offline payment requests.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-card border rounded-xl p-6 flex flex-col md:flex-row gap-6 md:items-center justify-between shadow-sm">
                            <div className="space-y-4 md:space-y-0 md:flex flex-1 gap-8">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Order ID</p>
                                    <p className="font-mono text-sm">{order.orderNumber}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Business Details</p>
                                    <p className="font-semibold">{order.business.name}</p>
                                    <p className="text-xs text-muted-foreground">{order.businessId}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Requested Plan</p>
                                    <p className="font-semibold">{order.plan.name} <span className="text-xs font-normal bg-primary/10 text-primary px-2 rounded-full uppercase">{order.billingCycle}</span></p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Total Paid</p>
                                    <p className="font-bold text-lg text-green-600 dark:text-green-500">₹{Number(order.total)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Time Logged</p>
                                    <p className="font-medium text-sm flex items-center"><Clock className="w-3 h-3 mr-1" /> {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <Button
                                    className="flex-1 md:flex-none h-10 bg-green-600 hover:bg-green-700 text-white font-semibold"
                                    onClick={() => handleApprove(order.id)}
                                    disabled={isPending && processingId === order.id}
                                >
                                    {isPending && processingId === order.id ? (
                                        <><RefreshCw className="mr-2 w-4 h-4 animate-spin" /> Verifying...</>
                                    ) : (
                                        <><Check className="mr-2 w-4 h-4" /> Approve Payment</>
                                    )}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
