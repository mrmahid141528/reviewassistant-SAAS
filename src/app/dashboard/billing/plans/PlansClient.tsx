"use client"

import { useState, useTransition } from "react"
import Script from "next/script"
import { Check, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { forceActivateFreeTrialSync } from "./actions"

export default function PlansClient({ plans, activePlanId, currentLocationCount }: any) {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

    const getPlanLimits = (plan: any) => {
        if (!plan.limits) return { locations: -1 }
        return { locations: plan.limits.locations ?? -1 }
    }

    const currentPlan = plans.find((p: any) => p.id === activePlanId)

    const handleUpgrade = (selectedPlanId: string, allowedLocations: number, price: number) => {
        if (currentLocationCount > allowedLocations && allowedLocations !== -1) {
            alert(`⚠️ You can't downgrade yet.\nYou currently have ${currentLocationCount} active locations, but this plan supports only ${allowedLocations}. Before downgrading, please deactivate ${currentLocationCount - allowedLocations} locations.`);
            return;
        }

        if (price === 0) {
            setError(null)
            setLoadingPlan(selectedPlanId)
            startTransition(async () => {
                const res = await forceActivateFreeTrialSync(selectedPlanId)
                if (res.error) {
                    setError(res.error)
                } else {
                    alert('Zero-cost Plan activated instantly!');
                    window.location.reload();
                }
                setLoadingPlan(null)
            })
        } else {
            // Redirect to the new Checkout UI
            window.location.href = `/dashboard/billing/checkout/${selectedPlanId}?cycle=${billingCycle}`;
        }
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-500">

            {error && (
                <div className="bg-destructive/10 text-destructive text-sm font-bold p-4 rounded-xl border border-destructive/20 flex gap-2 items-start">
                    <AlertTriangle className="h-5 w-5 shrink-0" /> {error}
                </div>
            )}

            <div className="text-center mb-10">
                <h3 className="text-sm font-bold tracking-widest text-muted-foreground uppercase mb-4 ml-1">PLANS & PRICING</h3>
                <p className="text-muted-foreground mt-2 font-medium">Choose the plan that fits your business. Change plans anytime.</p>

                <div className="inline-flex items-center p-1 bg-muted rounded-full mt-6 shadow-inner">
                    <button
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBillingCycle('yearly')}
                        className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Yearly <span className="bg-primary/10 text-primary text-[10px] uppercase px-2 py-0.5 rounded-full ring-1 ring-primary/20">Save 20%</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 lg:max-w-4xl lg:mx-auto gap-8">
                {plans.length === 0 && (
                    <div className="col-span-2 text-center py-10 text-muted-foreground bg-card border rounded-2xl">
                        No pricing plans discovered globally.
                    </div>
                )}

                {plans.map((plan: any) => {
                    const isPopular = plan.slug === 'growth';
                    const isContactOnly = plan.limits?.customPlan === true;
                    const isCurrentPlan = plan.id === activePlanId;
                    const planLimits = getPlanLimits(plan);
                    const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;

                    return (
                        <div key={plan.id} className={`relative flex flex-col bg-card rounded-[2rem] overflow-hidden transition-all duration-300 hover:shadow-xl ${isPopular ? 'ring-2 ring-primary shadow-lg scale-[1.02] z-10' : 'ring-1 ring-border shadow-sm'}`}>
                            {isPopular && (
                                <div className="absolute top-0 inset-x-0 w-full flex justify-center mt-3">
                                    <span className="bg-primary text-primary-foreground text-[9px] font-black uppercase tracking-widest py-1.5 px-4 rounded-full shadow-sm">
                                        Most Popular
                                    </span>
                                </div>
                            )}
                            <div className={`p-8 ${isPopular ? 'pt-14' : 'pt-10'} flex-1 flex flex-col`}>
                                <h3 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-1.5">
                                    {plan.name} {isCurrentPlan && <Check className="w-5 h-5 text-green-500" />}
                                </h3>
                                <p className="text-muted-foreground text-sm font-medium mb-8 h-10">{plan.description}</p>

                                <div className="mb-8">
                                    <span className="text-4xl font-black text-foreground tracking-tight">
                                        {isContactOnly ? "Custom" : `₹${Math.round(Number(price))}`}
                                    </span>
                                    {!isContactOnly && <span className="text-muted-foreground font-medium">/{billingCycle === 'yearly' ? 'yr' : 'mo'}</span>}

                                    {billingCycle === 'yearly' && !isContactOnly && (
                                        <p className="text-sm font-bold text-green-600 mt-2 bg-green-500/10 w-fit px-3 py-1 rounded-md">
                                            Save ₹{Math.round(Number(plan.priceMonthly * 12 - plan.priceYearly))}
                                        </p>
                                    )}
                                </div>

                                <ul className="space-y-4 mb-10 flex-1">
                                    {plan.features?.map((feature: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-3 text-sm font-medium text-muted-foreground">
                                            <Check className="w-5 h-5 text-primary shrink-0 transition-opacity bg-primary/10 rounded-full p-1" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    disabled={loadingPlan === plan.id || isCurrentPlan}
                                    onClick={() => !isContactOnly && handleUpgrade(plan.id, planLimits.locations, Number(price))}
                                    variant={isCurrentPlan ? "secondary" : isPopular ? "default" : "outline"}
                                    size="lg"
                                    className={`w-full font-bold h-12 rounded-xl transition-all ${isPopular && !isCurrentPlan ? 'shadow-[0_8px_20px_rgba(var(--primary-rgb),0.25)] hover:shadow-[0_8px_25px_rgba(var(--primary-rgb),0.35)]' : ''}`}
                                >
                                    {isCurrentPlan ? "Current Plan"
                                        : loadingPlan === plan.id ? "Processing..."
                                            : isContactOnly ? "Contact Sales"
                                                : (currentPlan?.priceMonthly && Number(plan.priceMonthly) < Number(currentPlan.priceMonthly)) ? "Downgrade"
                                                    : "Upgrade Plan"}
                                </Button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
