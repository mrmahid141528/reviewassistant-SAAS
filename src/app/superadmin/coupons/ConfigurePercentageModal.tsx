"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { updateGlobalAnnualDiscount } from "./actions"

export function ConfigurePercentageModal({ currentPercentage }: { currentPercentage: number }) {
    const [open, setOpen] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)
    const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsLoading(true)
        setErrorMsg(null)

        const formData = new FormData(e.currentTarget)
        const percent = Number(formData.get('percentage'))

        try {
            const result = await updateGlobalAnnualDiscount(percent)
            if (result.error) throw new Error(result.error)
            setOpen(false)
        } catch (error: any) {
            setErrorMsg(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button variant="outline" className="ml-auto bg-white" />}>
                Configure Percentage
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Annual Billing Discount</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    {errorMsg && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
                            {errorMsg}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Discount Percentage</Label>
                            <div className="relative">
                                <Input
                                    name="percentage"
                                    type="number"
                                    min="0"
                                    max="100"
                                    defaultValue={currentPercentage}
                                    required
                                    className="pr-8"
                                />
                                <span className="absolute right-3 top-2.5 text-slate-500 font-medium">%</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                This will instantly batch-update the `priceYearly` field for all active Pricing Plans based on their monthly price.
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Updating Plans...' : 'Apply Global Discount'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
