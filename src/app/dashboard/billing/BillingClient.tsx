"use client"

import { useState } from "react"
import { useTransition } from "react"
import Script from "next/script"
import { Check, Star, Building2, Globe, Rocket } from "lucide-react"

export default function BillingClient({ plans, activePlanId, daysSinceCreated, isExpired }: { plans: any[], activePlanId: string | null, daysSinceCreated: number, isExpired: boolean }) {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

    const handleUpgrade = (selectedPlanId: string) => {
        setError(null)
        setLoadingPlan(selectedPlanId)
        startTransition(async () => {
            try {
                // Fetch the subscription ID from our server backend securely
                const res = await fetch("/api/razorpay/checkout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ planId: selectedPlanId })
                })

                const data = await res.json()

                if (!res.ok) {
                    throw new Error(data.error || "Failed to initiate checkout")
                }

                const { subscriptionId, testModeSwitched } = data;

                if (testModeSwitched) {
                    alert(`Developer Test-Mode Active: No API Keys detected. You have been upgraded to ${selectedPlanId} instantly!`);
                    window.location.reload();
                    return;
                }

                // Razorpay standard checkout configuration for Real Deployment
                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Use Razorpay test/prod public key
                    subscription_id: subscriptionId,
                    name: "Review Assistant SaaS",
                    description: `Subscription Upgrade: ${selectedPlanId}`,
                    handler: function (response: any) {
                        alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`)
                        window.location.reload()
                    },
                    theme: {
                        color: "#2563EB"
                    }
                }

                // @ts-ignore
                const rzp = new window.Razorpay(options)
                rzp.open()

            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoadingPlan(null)
            }
        })
    }

    // Helper mapping for dynamic icons
    const getIcon = (slug: string) => {
        if (slug === 'starter') return Star;
        if (slug === 'growth') return Rocket;
        if (slug === 'enterprise') return Building2;
        return Globe; // Default for business
    }

    const getIconClass = (slug: string) => {
        if (slug === 'starter') return "bg-gray-100 text-gray-600";
        if (slug === 'growth') return "bg-blue-100 text-blue-600";
        if (slug === 'enterprise') return "bg-slate-100 text-slate-600";
        return "bg-indigo-100 text-indigo-600";
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto pt-6 pb-20">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />

            <div>
                <h1 className="text-3xl font-bold tracking-tight">Billing & Plans</h1>
                <p className="text-muted-foreground mt-1">Manage your active subscription or upgrade your Tier.</p>
            </div>

            <div className="bg-white border rounded-xl p-8 shadow-sm mb-12">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Current Plan</h2>
                        {activePlanId ? (
                            <p className="text-sm mt-1 text-gray-500">You are currently subscribed to the <strong className="text-gray-800">{plans.find(p => p.id === activePlanId || p.slug === activePlanId)?.name || ((activePlanId && activePlanId.includes("plan_")) ? 'External Gateway' : 'Custom')}</strong> plan.</p>
                        ) : isExpired ? (
                            <p className="text-sm mt-1 text-red-500">Your Free Trial has expired. Please choose a plan below.</p>
                        ) : (
                            <p className="text-sm mt-1 text-gray-500">You are currently on the <strong className="text-gray-800">Free Trial</strong> ({Math.max(0, 7 - daysSinceCreated)} days remaining).</p>
                        )}
                        {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}
                    </div>
                    <div className="text-right">
                        {activePlanId ? (
                            <span className="inline-flex items-center rounded-md bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-600/10 uppercase tracking-widest">
                                Active Subscription
                            </span>
                        ) : isExpired ? (
                            <span className="inline-flex items-center rounded-md bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-600/10 uppercase tracking-widest">
                                Suspended
                            </span>
                        ) : (
                            <span className="inline-flex items-center rounded-md bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-600/10 uppercase tracking-widest">
                                Active Trial
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-center mb-8">Select your upgrade</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {plans.length === 0 && (
                    <div className="col-span-4 text-center py-10 text-gray-500 bg-white border rounded">
                        No pricing plans discovered globally. Please ask the super-admin to provision Pricing Tiers.
                    </div>
                )}

                {plans.map((plan) => {
                    const isPopular = plan.slug === 'growth'; // Map popular logic dynamically
                    const isContactOnly = plan.limits?.customPlan === true;
                    const Icon = getIcon(plan.slug);
                    const iconClass = getIconClass(plan.slug);

                    return (
                        <div key={plan.id} className={`relative flex flex-col bg-white border rounded-2xl shadow-sm overflow-hidden ${isPopular ? 'ring-2 ring-blue-600' : 'ring-1 ring-gray-200'}`}>
                            {isPopular && (
                                <div className="absolute top-0 inset-x-0 flex justify-center">
                                    <span className="bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-b-lg">
                                        Most Popular
                                    </span>
                                </div>
                            )}
                            <div className="p-6 pt-10 flex-1 flex flex-col">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`p-2 rounded-lg ${iconClass}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                                </div>
                                <p className="text-gray-500 text-sm mb-6 h-10">{plan.description}</p>
                                <div className="mb-6">
                                    <span className="text-3xl font-bold text-gray-900">
                                        {isContactOnly ? "Custom" : `₹${Number(plan.priceMonthly)}`}
                                    </span>
                                    {!isContactOnly && <span className="text-gray-500">/mo</span>}
                                </div>
                                <ul className="space-y-3 mb-8 flex-1">
                                    {plan.features?.map((feature: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                            <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    disabled={loadingPlan === plan.id || plan.id === activePlanId || plan.slug === activePlanId}
                                    onClick={() => !isContactOnly && handleUpgrade(plan.id)}
                                    className={`w-full py-2.5 rounded-lg font-medium text-sm transition-colors ${(plan.id === activePlanId || plan.slug === activePlanId) ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed' : isContactOnly ? 'bg-gray-100 text-gray-900 border hover:bg-gray-200' : isPopular ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm' : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50'}`}
                                >
                                    {(plan.id === activePlanId || plan.slug === activePlanId) ? "Current Plan" : loadingPlan === plan.id ? "Processing..." : isContactOnly ? "Contact Sales" : "Upgrade Plan"}
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
