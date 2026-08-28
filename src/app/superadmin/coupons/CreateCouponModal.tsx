"use client"

import * as React from "react"
import { PlusCircle, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createCoupon } from "./actions"

export function CreateCouponModal({ plans }: { plans: { id: string, name: string }[] }) {
    const [open, setOpen] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)
    const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsLoading(true)
        setErrorMsg(null)
        const formData = new FormData(e.currentTarget)

        try {
            const formData = new FormData(e.currentTarget)
            const appliesToToggle = formData.get('appliesToToggle') as string;
            const appliesToSelected = appliesToToggle === 'all'
                ? ['all']
                : formData.getAll('appliesTo').map(String);

            const result = await createCoupon({
                code: formData.get('code') as string,
                type: formData.get('type') as 'percentage' | 'fixed',
                value: Number(formData.get('value')),
                appliesTo: appliesToSelected,
                billingCycle: formData.get('billingCycle') as any,
                maxRedemptions: formData.get('maxRedemptions') ? Number(formData.get('maxRedemptions')) : null,
                perCustomer: 1,
                validFrom: new Date(formData.get('validFrom') as string),
                validUntil: formData.get('validUntil') ? new Date(formData.get('validUntil') as string) : null,
                minPurchase: formData.get('minPurchase') ? Number(formData.get('minPurchase')) : null,
                duration: formData.get('duration') as any,
                durationInMonths: formData.get('durationInMonths') ? Number(formData.get('durationInMonths')) : null
            })

            if (result?.error) {
                setErrorMsg(result.error)
            } else {
                setOpen(false)
            }
        } catch (err: any) {
            setErrorMsg(err.message || 'Failed to create coupon')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button className="h-10 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm" />}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Coupon
            </DialogTrigger>
            <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create Coupon</DialogTitle>
                </DialogHeader>
                {errorMsg && (
                    <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {errorMsg}
                    </div>
                )}
                <form onSubmit={onSubmit} className="space-y-6 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Coupon Code</Label>
                            <Input name="code" placeholder="LAUNCH50" required />
                        </div>
                        <div className="space-y-2">
                            <Label>Discount Type</Label>
                            <Select name="type" defaultValue="percentage">
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="percentage">Percentage</SelectItem>
                                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Discount Value</Label>
                            <Input name="value" type="number" min="1" step="0.01" placeholder="50" required />
                        </div>
                        <div className="space-y-2">
                            <Label>Billing Cycle</Label>
                            <Select name="billingCycle" defaultValue="both">
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="both">Both</SelectItem>
                                    <SelectItem value="monthly">Monthly Only</SelectItem>
                                    <SelectItem value="yearly">Yearly Only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3 col-span-2">
                            <Label>Applies To Plans</Label>
                            <Select name="appliesToToggle" defaultValue="all">
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Active Plans</SelectItem>
                                    <SelectItem value="specific">Specific Plans (Requires manual selection below)</SelectItem>
                                </SelectContent>
                            </Select>
                            <div className="flex flex-wrap gap-3 mt-2 p-3 bg-slate-50 border rounded-lg">
                                {plans.map(plan => (
                                    <label key={plan.id} className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                                        <input type="checkbox" name="appliesTo" value={plan.id} className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4" />
                                        {plan.name}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Max Redemptions (Optional)</Label>
                            <Input name="maxRedemptions" type="number" placeholder="100" />
                        </div>
                        <div className="space-y-2">
                            <Label>Duration</Label>
                            <Select name="duration" defaultValue="first_payment">
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="first_payment">First Payment Only</SelectItem>
                                    <SelectItem value="first_n_months">First N Months</SelectItem>
                                    <SelectItem value="forever">Forever</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Input name="validFrom" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
                        </div>
                        <div className="space-y-2">
                            <Label>Expiry Date (Optional)</Label>
                            <Input name="validUntil" type="date" />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create Coupon'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
