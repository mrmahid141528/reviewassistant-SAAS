"use client"

import { useEffect, useState } from "react"
import { getPlans, updatePlan, seedPlans } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function PricingCMSPage() {
    const [plans, setPlans] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [editingPlan, setEditingPlan] = useState<any>(null)

    const fetchPlans = async () => {
        const data = await getPlans();
        setPlans(data);
        setLoading(false);
    }

    useEffect(() => {
        fetchPlans();
    }, [])

    const handleSeed = async () => {
        const res = await seedPlans();
        if (res.success) {
            alert("Default plans created!")
            fetchPlans();
        } else {
            alert(res.msg);
        }
    }

    if (loading) return <div className="p-8">Loading plans...</div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 border rounded-xl shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Pricing Plans CMS</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Control the subscription tiers globally across the SaaS.</p>
                </div>
                {plans.length === 0 && (
                    <Button onClick={handleSeed} className="bg-blue-600">
                        Seed Initial 4 Tiers
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {plans.map(plan => (
                    <div key={plan.id} className="bg-white border rounded-xl p-6 flex flex-col shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-xl font-bold">{plan.name}</h2>
                                <p className="text-sm text-gray-500">{plan.description}</p>
                            </div>
                            <span className="text-lg font-bold bg-green-100 text-green-800 px-3 py-1 rounded-full">
                                {plan.limits?.customPlan ? "Custom Pricing" : `₹${Number(plan.priceMonthly)}/mo`}
                            </span>
                        </div>

                        <div className="flex-1 mb-6">
                            <h4 className="text-xs font-semibold uppercase text-gray-400 mb-2">Display Features:</h4>
                            <ul className="text-sm space-y-1 text-gray-700 list-disc ml-4">
                                {plan.features?.map((f: string, i: number) => <li key={i}>{f}</li>)}
                            </ul>

                            <h4 className="text-xs font-semibold uppercase text-gray-400 mt-4 mb-2">System Backend Limits (JSON):</h4>
                            <pre className="bg-gray-50 text-xs p-3 rounded text-gray-700 overflow-x-auto border">
                                {JSON.stringify(plan.limits, null, 2)}
                            </pre>
                        </div>

                        <Button variant="outline" onClick={() => setEditingPlan(plan)} className="w-full">Edit Plan Parameters</Button>

                        {editingPlan?.id === plan.id && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto">
                                <div className="bg-white p-6 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold">Edit {plan.name} Tier</h3>
                                        <button onClick={() => setEditingPlan(null)} className="text-gray-500 hover:text-black">✕</button>
                                    </div>
                                    <form action={async (formData) => {
                                        await updatePlan(plan.id, formData)
                                        alert("Plan Updated Globally!")
                                        setEditingPlan(null)
                                        fetchPlans();
                                    }} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Tier Name</Label>
                                                <Input name="name" defaultValue={plan.name} required />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Monthly Price (INR)</Label>
                                                <Input name="priceMonthly" type="number" defaultValue={Number(plan.priceMonthly)} required />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Short Description</Label>
                                            <Input name="description" defaultValue={plan.description || ''} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Features List (Valid JSON Array)</Label>
                                            <Textarea
                                                name="features"
                                                defaultValue={JSON.stringify(plan.features, null, 2)}
                                                rows={5}
                                                className="font-mono text-sm leading-tight"
                                            />
                                            <p className="text-xs text-muted-foreground">Example: ["1 Location", "Unlimited API"]</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>System Limits (Valid JSON Object)</Label>
                                            <Textarea
                                                name="limits"
                                                defaultValue={JSON.stringify(plan.limits, null, 2)}
                                                rows={5}
                                                className="font-mono text-sm leading-tight"
                                            />
                                            <p className="text-xs text-muted-foreground">Used by backend middleware to enforce restrictions.</p>
                                        </div>

                                        <div className="flex gap-3 pt-4">
                                            <Button type="button" variant="outline" onClick={() => setEditingPlan(null)} className="flex-1">Cancel</Button>
                                            <Button type="submit" className="flex-1">Save Changes to Database</Button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {plans.length === 0 && (
                <div className="text-center p-12 bg-white border rounded-lg text-gray-500">
                    No Plans found in the database. Click "Seed Initial 4 Tiers" above.
                </div>
            )}
        </div>
    )
}
