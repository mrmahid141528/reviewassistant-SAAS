"use client"

import { useState, useEffect, useTransition } from "react"
import { Save, Smartphone, Percent } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { getBillingConfig, updateBillingConfig } from "./actions"

export default function BillingSettingsForm() {
    const [isPending, startTransition] = useTransition()
    const [formData, setFormData] = useState({ whatsappNumber: "", gstPercentage: 18 })
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        getBillingConfig().then((res: any) => {
            if (!res.error) {
                setFormData({
                    whatsappNumber: res.whatsappNumber || "",
                    gstPercentage: res.gstPercentage ?? 18
                })
            }
            setIsLoading(false)
        })
    }, [])

    const handleSave = () => {
        setStatus(null)
        startTransition(async () => {
            const res = await updateBillingConfig({
                whatsappNumber: formData.whatsappNumber.replace(/[^0-9+]/g, ''),
                gstPercentage: Number(formData.gstPercentage)
            })
            if (res.error) {
                setStatus({ type: 'error', msg: res.error })
            } else {
                setStatus({ type: 'success', msg: 'Billing Configuration saved successfully' })
            }
            setTimeout(() => setStatus(null), 3000)
        })
    }

    if (isLoading) return <div className="h-40 animate-pulse bg-slate-100 rounded-xl" />

    return (
        <Card className="border-slate-200 shadow-sm animate-in fade-in fill-mode-both">
            <CardHeader className="pb-3 border-b bg-slate-50/50">
                <CardTitle className="text-lg">Checkout Core Configuration</CardTitle>
                <CardDescription>Target WhatsApp number and global Tax assignments for Offline Invoices.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold flex items-center"><Smartphone className="w-4 h-4 mr-1 text-slate-500" /> Admin WhatsApp Number</label>
                        <Input
                            value={formData.whatsappNumber}
                            onChange={(e) => setFormData(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                            placeholder="e.g. +91 9000000000"
                        />
                        <p className="text-[11px] text-muted-foreground">Orders and activation requests will be deep-linked to this number.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold flex items-center"><Percent className="w-4 h-4 mr-1 text-slate-500" /> Global GST Percentage</label>
                        <Input
                            type="number"
                            value={formData.gstPercentage}
                            onChange={(e) => setFormData(prev => ({ ...prev, gstPercentage: Number(e.target.value) }))}
                        />
                        <p className="text-[11px] text-muted-foreground">This rate is dynamically multiplied into all subscription totals.</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 mt-6 pt-4 border-t border-dashed">
                    <Button onClick={handleSave} disabled={isPending} className="font-semibold shadow-sm w-32">
                        {isPending ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save</>}
                    </Button>

                    {status && (
                        <span className={`text-sm font-medium ${status.type === 'error' ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {status.msg}
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
