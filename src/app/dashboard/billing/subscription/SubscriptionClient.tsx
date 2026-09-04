"use client"

import { Rocket } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SubscriptionClient({ subscription, isExpired, daysSinceCreated, hasPreviousPaid, trialLimit }: any) {
    const renewalDate = subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString("en-IN", { day: 'numeric', month: 'long', year: 'numeric' }) : "Trial ends soon (or Upgrade required)";

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {isExpired && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive p-5 sm:p-6 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in zoom-in-95">
                    <div>
                        <h3 className="font-bold text-lg sm:text-xl">
                            {hasPreviousPaid ? "Your Subscription has expired" : "Your Free Trial has expired"}
                        </h3>
                        <p className="font-medium opacity-90 text-[14px] sm:text-[15px]">
                            {hasPreviousPaid ? "Renew now to continue receiving reviews and access your dashboard features." : "Upgrade now to continue using Google Review Assistant."}
                        </p>
                    </div>
                    <Link href="/dashboard/billing/plans">
                        <Button variant="destructive" className="shadow-md h-11 px-6 text-[15px] font-bold shrink-0 w-full sm:w-auto">
                            {hasPreviousPaid ? "Renew Now" : "Upgrade Now"}
                        </Button>
                    </Link>
                </div>
            )}

            <h3 className="text-sm font-bold tracking-widest text-muted-foreground uppercase ml-1">CURRENT SUBSCRIPTION</h3>

            <div className="bg-card border border-primary/20 shadow-[0_10px_40px_rgba(var(--primary-rgb),0.05)] rounded-3xl overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                <div className="p-8 sm:p-10">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground">STATUS</h2>
                                {subscription ? (
                                    <span className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-bold text-green-700 dark:text-green-400">
                                        ● ACTIVE
                                    </span>
                                ) : isExpired ? (
                                    <span className="inline-flex items-center rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-bold text-destructive">
                                        ● EXPIRED
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                                        ● TRIAL ({Math.max(0, Math.ceil((trialLimit || 7) - daysSinceCreated))} DAYS LEFT)
                                    </span>
                                )}
                            </div>
                            <h3 className="text-3xl sm:text-4xl font-bold text-foreground mt-2 flex items-center gap-3">
                                {subscription ? subscription.plan?.name : "Free Trial"}
                                {subscription?.plan?.slug === "growth" && <Rocket className="h-6 w-6 text-primary" />}
                            </h3>
                            {subscription && (
                                <p className="text-2xl font-medium text-foreground mt-4">
                                    ₹{Number(subscription.plan?.priceMonthly)} <span className="text-base text-muted-foreground">/ month</span>
                                </p>
                            )}
                        </div>
                        <div className="sm:text-right bg-muted/30 p-5 rounded-2xl w-full sm:w-auto border border-border/50">
                            <p className="text-sm font-medium text-muted-foreground">Next billing date</p>
                            <p className="text-lg font-bold text-foreground mt-1 text-primary">
                                {renewalDate}
                            </p>
                            <div className="mt-4 flex gap-3 sm:justify-end">
                                <Link href="/dashboard/billing/plans">
                                    <Button variant="default" className="font-semibold shadow-md h-10 px-6">Manage / Upgrade Plan</Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-muted/40 rounded-xl text-sm text-muted-foreground">
                <p><strong>Note:</strong> Your subscription gives you access to a predefined limit of features and locations based on your selected plan tier. Please ensure your payments are up to date to prevent any service interruptions.</p>
            </div>
        </div>
    )
}
