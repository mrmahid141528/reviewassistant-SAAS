"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { updatePlan, archivePlan, seedPlans, updateTrialDuration } from "./actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Banknote, Check, Target, CreditCard, LayoutTemplate, MoreHorizontal, Settings, Info, AlertTriangle, Calendar, Save } from "lucide-react"

export function PricingClient({ plans, stats, trialDuration = 7 }: { plans: any[], stats: any, trialDuration?: number }) {
    const [editingPlan, setEditingPlan] = useState<any>(null)
    const [compareMode, setCompareMode] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // Global Settings State
    const [editingTrial, setEditingTrial] = useState(false)
    const [localTrialDuration, setLocalTrialDuration] = useState(trialDuration)
    const [applyTarget, setApplyTarget] = useState("all") // all | active | new
    const [isSavingTrial, setIsSavingTrial] = useState(false)

    // Form state
    const [formData, setFormData] = useState<any>({})

    const handleSeed = async () => {
        const res = await seedPlans();
        if (res.success) {
            alert("Default plans created! Refreshing...")
            window.location.reload()
        } else {
            alert(res.msg);
        }
    }

    const openEdit = (plan: any) => {
        setFormData({
            name: plan.name,
            description: plan.description || "",
            priceMonthly: plan.priceMonthly,
            priceYearly: plan.priceYearly,
            status: plan.status,
            features: {
                aiReviews: plan.features?.includes("Unlimited AI Reviews") || plan.features?.includes("50 AI Reviews/month") || false,
                noWatermark: !plan.limits?.hasWatermark,
                advancedAnalytics: plan.features?.includes("Advanced Analytics"),
                csvExport: plan.features?.includes("CSV Bulk Export"),
                staffAccounts: plan.features?.includes("Staff Accounts"),
                apiAccess: plan.features?.includes("API Access (Future)"),
                whiteLabel: plan.features?.includes("Whitelabel Dashboard")
            },
            limits: {
                maxLocations: plan.limits?.maxLocations || 1,
                maxGenerations: plan.limits?.maxGenerations || -1,
                teamMembers: plan.limits?.teamMembers || 5, // New mock limit for demonstration
            }
        })
        setEditingPlan(plan)
    }

    const saveChanges = async () => {
        setIsSaving(true)
        try {
            // Re-construct the JSON structure from the structured UI for the backend
            const structuredFeatures = []
            if (formData.features.aiReviews) structuredFeatures.push(formData.limits.maxGenerations === -1 ? "Unlimited AI Reviews" : `${formData.limits.maxGenerations} AI Reviews/month`)
            if (formData.features.noWatermark) structuredFeatures.push("No Watermark")
            else structuredFeatures.push("Standard Branding")
            if (formData.features.advancedAnalytics) structuredFeatures.push("Advanced Analytics")
            else structuredFeatures.push("Basic Analytics")
            if (formData.features.csvExport) structuredFeatures.push("CSV Bulk Export")
            if (formData.features.staffAccounts) structuredFeatures.push("Staff Accounts")
            if (formData.features.apiAccess) structuredFeatures.push("API Access")
            if (formData.features.whiteLabel) structuredFeatures.push("Whitelabel Dashboard")

            const structuredLimits = {
                maxLocations: formData.limits.maxLocations,
                maxGenerations: formData.limits.maxGenerations,
                teamMembers: formData.limits.teamMembers,
                hasWatermark: !formData.features.noWatermark
            }

            const payload = {
                name: formData.name,
                description: formData.description,
                priceMonthly: Number(formData.priceMonthly),
                priceYearly: Number(formData.priceYearly),
                status: formData.status,
                features: structuredFeatures,
                limits: structuredLimits
            }

            const res = await updatePlan(editingPlan.id, payload)
            if (res.success) {
                setEditingPlan(null)
                alert("Plan updated globally.")
                window.location.reload()
            }
        } catch (e) {
            console.error(e)
            alert("An error occurred trying to update the plan.")
        }
        setIsSaving(false)
    }

    const saveTrialConfig = async () => {
        setIsSavingTrial(true)
        try {
            const res = await updateTrialDuration(localTrialDuration, applyTarget)
            if (res.success) {
                alert(`Global Free Trial Duration updated successfully! Targeted Rule: ${applyTarget}`)
                setEditingTrial(false)
            }
        } catch (e) {
            console.error(e)
            alert("An error occurred trying to update the free trial configuration.")
        }
        setIsSavingTrial(false)
    }

    const handleArchive = async (id: string, subscribersCount: number) => {
        if (subscribersCount > 0) {
            alert(`This plan has ${subscribersCount} active subscriptions and cannot be deleted. Archiving instead...`)
        } else {
            if (!confirm("Are you sure you want to archive this plan?")) return
        }
        await archivePlan(id)
        window.location.reload()
    }

    const renderFeatureCheckbox = (key: string, label: string) => (
        <label className="flex items-center gap-3 space-y-0 text-sm py-2 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-slate-50 p-2 rounded-md">
            <Switch
                checked={formData.features[key]}
                onCheckedChange={(checked) => setFormData({ ...formData, features: { ...formData.features, [key]: checked } })}
            />
            <span className="font-medium text-slate-700">{label}</span>
        </label>
    )

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div className="flex justify-between items-start bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Pricing Plans</h1>
                    <p className="text-muted-foreground mt-1 text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg inline-flex items-center gap-2 mt-2">
                        <Settings className="h-4 w-4" /> Manage subscription plans, features, limits and billing configuration.
                    </p>
                </div>
                <div className="flex gap-3">
                    {plans.length === 0 && (
                        <Button onClick={handleSeed} className="bg-blue-600 shadow-sm">
                            Seed Initial Tiers
                        </Button>
                    )}
                    <Button variant="outline" className="shadow-sm font-semibold" onClick={() => setCompareMode(!compareMode)}>
                        {compareMode ? "Show Cards" : "Compare Plans"}
                    </Button>
                </div>
            </div>

            {/* Analytics Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-[13px] font-semibold text-slate-600">Total Plans</CardTitle>
                        <LayoutTemplate className="h-4 w-4 text-violet-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{stats.totalPlans}</div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-[13px] font-semibold text-slate-600">Active Subscriptions</CardTitle>
                        <Target className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{stats.activeSubs}</div>
                        <p className="text-xs text-slate-500 mt-1">Paying customers</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-[13px] font-semibold text-slate-600">MRR</CardTitle>
                        <Banknote className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">₹{stats.mrr.toLocaleString()}</div>
                        <p className="text-xs text-emerald-600 mt-1">Monthly Recurring Revenue</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-[13px] font-semibold text-slate-600">Most Popular</CardTitle>
                        <CreditCard className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{stats.popularPlan}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Global Settings */}
            {!compareMode && (
                <div className="mb-8">
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Platform Settings</h2>
                    <Card className="shadow-sm border-slate-200 bg-gradient-to-br from-slate-50 to-white max-w-xl">
                        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center gap-4 space-y-0">
                            <div className="bg-blue-100 p-2.5 rounded-xl shrink-0">
                                <Calendar className="h-5 w-5 text-blue-700" />
                            </div>
                            <div className="flex-1">
                                <CardTitle className="text-base text-slate-900">Global Free Trial Duration</CardTitle>
                                <CardDescription className="text-xs">
                                    Define the number of days a newly registered business can use the platform for free before requiring a paid subscription.
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-end gap-2">
                                        <span className="text-3xl font-bold text-slate-800">{trialDuration}</span>
                                        <span className="text-sm font-medium text-slate-500 mb-1">Days</span>
                                    </div>
                                    <p className="text-xs text-slate-400 font-medium">Platform default allowance</p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditingTrial(true)}
                                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                                >
                                    <Settings className="h-3.5 w-3.5 mr-2" />
                                    Configure Trial
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Plan Cards Display */}
            {!compareMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {plans.map(plan => {
                        const subsCount = plan._count?.subscriptions || 0;
                        const isArchived = plan.status === 'archived';
                        return (
                            <div key={plan.id} className={`bg-white border rounded-2xl flex flex-col shadow-sm relative overflow-hidden transition-all ${isArchived ? 'opacity-70 grayscale-[50%]' : 'hover:shadow-md'}`}>
                                {plan.slug === stats.popularPlan.toLowerCase() && (
                                    <div className="bg-orange-100 text-orange-800 text-[10px] font-bold uppercase tracking-wider text-center py-1 absolute top-0 w-full left-0">
                                        Most Popular ★
                                    </div>
                                )}
                                <div className={`p-6 ${plan.slug === stats.popularPlan.toLowerCase() ? 'pt-8' : ''}`}>
                                    <h3 className="text-xl font-extrabold">{plan.name}</h3>
                                    <div className="mt-4 mb-2 flex items-baseline gap-1">
                                        <span className="text-2xl font-black">₹{Math.round(Number(plan.priceMonthly))}</span>
                                        <span className="text-sm font-medium text-slate-500">/mo</span>
                                    </div>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isArchived ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-700'}`}>
                                        ● {plan.status}
                                    </span>
                                </div>

                                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex-1">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Features</h4>
                                    <ul className="space-y-2 mb-6">
                                        {plan.features?.slice(0, 4).map((f: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2 text-[13px] text-slate-700 font-medium">
                                                <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                                                <span>{f}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Limits</h4>
                                    <div className="bg-white rounded-lg border border-slate-200 p-3 text-[13px] font-medium text-slate-700 space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Locations</span>
                                            <span>{plan.limits?.maxLocations === -1 ? 'Unlimited' : plan.limits?.maxLocations || 1}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">AI Reviews</span>
                                            <span>{plan.limits?.maxGenerations === -1 ? 'Unlimited' : plan.limits?.maxGenerations || 0}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-white text-sm">
                                    <span className="text-slate-500 font-medium">{subsCount} subscribers</span>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => openEdit(plan)}>Edit</Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50" onClick={() => handleArchive(plan.id, subsCount)}>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-600 font-bold border-b">
                                <tr>
                                    <th className="px-6 py-4 w-48">Feature / Plan</th>
                                    {plans.map(p => <th key={p.id} className="px-6 py-4 text-center">{p.name}</th>)}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                <tr>
                                    <td className="px-6 py-4 bg-slate-50/50 text-slate-500 font-semibold">Monthly Price</td>
                                    {plans.map(p => <td key={p.id} className="px-6 py-4 text-center">₹{Math.round(Number(p.priceMonthly))}</td>)}
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 bg-slate-50/50 text-slate-500 font-semibold">Max Locations</td>
                                    {plans.map(p => <td key={p.id} className="px-6 py-4 text-center">{p.limits?.maxLocations === -1 ? 'Unlimited' : p.limits?.maxLocations || 1}</td>)}
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 bg-slate-50/50 text-slate-500 font-semibold">AI Reviews / mo</td>
                                    {plans.map(p => <td key={p.id} className="px-6 py-4 text-center">{p.limits?.maxGenerations === -1 ? 'Unlimited' : p.limits?.maxGenerations || 0}</td>)}
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 bg-slate-50/50 text-slate-500 font-semibold">Status</td>
                                    {plans.map(p => <td key={p.id} className="px-6 py-4 text-center">
                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${p.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200'}`}>{p.status}</span>
                                    </td>)}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingPlan && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto p-4 sm:p-6">
                    <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl relative">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Edit {editingPlan.name} Plan</h3>
                                <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-1">
                                    <Info className="h-3 w-3" /> Core system parameters & features
                                </p>
                            </div>
                            <button onClick={() => setEditingPlan(null)} className="h-8 w-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors shadow-sm">✕</button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/30">

                            {/* Warning Card */}
                            {editingPlan._count?.subscriptions > 0 && (
                                <div className="mb-8 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 shadow-sm">
                                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-amber-800 text-sm">Changing this plan may affect {editingPlan._count.subscriptions} active subscriptions.</h4>
                                        <p className="text-xs text-amber-700/80 mt-1">Changes to limits and features will be applied across the platform automatically to existing users depending on your implementation.</p>

                                        <div className="mt-3 flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer text-[13px] font-semibold text-amber-900">
                                                <input type="radio" name="applyIntent" defaultChecked className="accent-amber-600" /> Apply to existing & new subscriptions
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer text-[13px] font-semibold text-amber-900">
                                                <input type="radio" name="applyIntent" className="accent-amber-600" /> Apply to new subscriptions only (Clones Plan)
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                                        <h4 className="text-sm font-bold text-slate-900 border-b pb-2">Basic Information</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <Label className="text-xs text-slate-500 uppercase tracking-wider font-bold">Plan Name</Label>
                                                <Input className="mt-1 font-semibold" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                            </div>
                                            <div>
                                                <Label className="text-xs text-slate-500 uppercase tracking-wider font-bold">Description</Label>
                                                <Input className="mt-1" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-xs text-slate-500 uppercase tracking-wider font-bold">Monthly Price (₹)</Label>
                                                    <Input className="mt-1 font-mono font-bold text-slate-700" type="number" value={formData.priceMonthly} onChange={(e) => setFormData({ ...formData, priceMonthly: e.target.value })} />
                                                </div>
                                                <div>
                                                    <Label className="text-xs text-slate-500 uppercase tracking-wider font-bold">Yearly Price (₹)</Label>
                                                    <Input className="mt-1 font-mono font-bold text-slate-700" type="number" value={formData.priceYearly} onChange={(e) => setFormData({ ...formData, priceYearly: e.target.value })} />
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-xs text-slate-500 uppercase tracking-wider font-bold">Status</Label>
                                                <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mt-1"
                                                    value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                >
                                                    <option value="active">Active (Visible to users)</option>
                                                    <option value="archived">Archived (Hidden)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                                        <h4 className="text-sm font-bold text-slate-900 border-b pb-2">Usage Limits</h4>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                                <span className="text-sm font-bold text-slate-700">Locations Limit</span>
                                                <div className="flex items-center gap-2">
                                                    <label className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1 cursor-pointer">
                                                        <Switch checked={formData.limits.maxLocations === -1} onCheckedChange={(c) => setFormData({ ...formData, limits: { ...formData.limits, maxLocations: c ? -1 : 1 } })} /> Unlimited
                                                    </label>
                                                    {!(formData.limits.maxLocations === -1) && (
                                                        <Input type="number" className="w-20 h-8 font-mono text-center font-bold text-sm" value={formData.limits.maxLocations} onChange={(e) => setFormData({ ...formData, limits: { ...formData.limits, maxLocations: parseInt(e.target.value) } })} />
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                                <span className="text-sm font-bold text-slate-700">AI Reviews / Month</span>
                                                <div className="flex items-center gap-2">
                                                    <label className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1 cursor-pointer">
                                                        <Switch checked={formData.limits.maxGenerations === -1} onCheckedChange={(c) => setFormData({ ...formData, limits: { ...formData.limits, maxGenerations: c ? -1 : 50 } })} /> Unlimited
                                                    </label>
                                                    {!(formData.limits.maxGenerations === -1) && (
                                                        <Input type="number" className="w-20 h-8 font-mono text-center font-bold text-sm" value={formData.limits.maxGenerations} onChange={(e) => setFormData({ ...formData, limits: { ...formData.limits, maxGenerations: parseInt(e.target.value) } })} />
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                                <span className="text-sm font-bold text-slate-700">Team Members Limit</span>
                                                <div className="flex items-center gap-2">
                                                    <label className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1 cursor-pointer">
                                                        <Switch checked={formData.limits.teamMembers === -1} onCheckedChange={(c) => setFormData({ ...formData, limits: { ...formData.limits, teamMembers: c ? -1 : 5 } })} /> Unlimited
                                                    </label>
                                                    {!(formData.limits.teamMembers === -1) && (
                                                        <Input type="number" className="w-20 h-8 font-mono text-center font-bold text-sm" value={formData.limits.teamMembers} onChange={(e) => setFormData({ ...formData, limits: { ...formData.limits, teamMembers: parseInt(e.target.value) } })} />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 h-full">
                                        <h4 className="text-sm font-bold text-slate-900 border-b pb-2">Enabled Features</h4>
                                        <div className="flex flex-col">
                                            {renderFeatureCheckbox("aiReviews", "AI Review Generation Engine")}
                                            {renderFeatureCheckbox("noWatermark", "Remove 'Powered by Google Review Assistant' watermark")}
                                            {renderFeatureCheckbox("advancedAnalytics", "Advanced Analytics & Reporting")}
                                            {renderFeatureCheckbox("csvExport", "CSV Review Data Export")}
                                            {renderFeatureCheckbox("staffAccounts", "Multi-user Staff Accounts")}
                                            {renderFeatureCheckbox("apiAccess", "Raw API Access (Developer Key)")}
                                            {renderFeatureCheckbox("whiteLabel", "Complete Dashboard Whitelabeling")}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 sm:p-6 border-t border-slate-100 bg-white flex gap-4 shrink-0">
                            <Button type="button" variant="outline" onClick={() => setEditingPlan(null)} className="flex-1 font-semibold rounded-xl" disabled={isSaving}>Discard Changes</Button>
                            <Button type="button" className="flex-1 font-semibold rounded-xl bg-primary shadow-sm" onClick={saveChanges} disabled={isSaving}>
                                {isSaving ? "Saving Configuration..." : "Save Pricing Configuration"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Trial Settings Modal */}
            {editingTrial && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Define Trial Configuration</h3>
                                <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-1">Platform-wide Default</p>
                            </div>
                            <button onClick={() => setEditingTrial(false)} className="h-8 w-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 shadow-sm" disabled={isSavingTrial}>✕</button>
                        </div>

                        <div className="p-6 space-y-6 bg-white">
                            <div>
                                <Label className="text-[13px] font-bold text-slate-700">Trial Period (Days)</Label>
                                <div className="flex items-center gap-3 mt-1.5">
                                    <Input
                                        type="number"
                                        min="0"
                                        className="w-24 font-mono font-bold text-slate-800 text-center"
                                        value={localTrialDuration}
                                        onChange={(e) => setLocalTrialDuration(parseInt(e.target.value) || 0)}
                                    />
                                    <span className="text-sm font-medium text-slate-500 whitespace-nowrap">
                                        days from creation
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[13px] font-bold text-slate-700">Deployment Target</Label>

                                <label className={`flex gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${applyTarget === 'all' ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                                    <input type="radio" name="target" value="all" className="mt-1 accent-blue-600" checked={applyTarget === 'all'} onChange={(e) => setApplyTarget(e.target.value)} />
                                    <div>
                                        <div className="font-bold text-sm">All Businesses (Global Override)</div>
                                        <div className="text-xs mt-0.5 opacity-80 leading-relaxed">Overrides specific exceptions. Reactivates older businesses if increased.</div>
                                    </div>
                                </label>

                                <label className={`flex gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${applyTarget === 'active' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                                    <input type="radio" name="target" value="active" className="mt-1 accent-emerald-600" checked={applyTarget === 'active'} onChange={(e) => setApplyTarget(e.target.value)} />
                                    <div>
                                        <div className="font-bold text-sm">Active & Trialing Only</div>
                                        <div className="text-xs mt-0.5 opacity-80 leading-relaxed">Propagates to current users who haven't expired yet. Does not rescue expired accounts.</div>
                                    </div>
                                </label>

                                <label className={`flex gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${applyTarget === 'new' ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                                    <input type="radio" name="target" value="new" className="mt-1 accent-slate-600" checked={applyTarget === 'new'} onChange={(e) => setApplyTarget(e.target.value)} />
                                    <div>
                                        <div className="font-bold text-sm">New Businesses Only</div>
                                        <div className="text-xs mt-0.5 opacity-80 leading-relaxed">Modifies the platform default for future signups. Current users keep their current limits.</div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="p-4 border-t border-slate-100 flex gap-3 bg-slate-50/50">
                            <Button variant="outline" className="flex-1" onClick={() => setEditingTrial(false)} disabled={isSavingTrial}>Cancel</Button>
                            <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={saveTrialConfig} disabled={isSavingTrial}>
                                {isSavingTrial ? "Saving Config..." : "Deploy Configuration"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
