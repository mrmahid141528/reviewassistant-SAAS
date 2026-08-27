"use client"

import * as React from "react"
import { Ticket, Search, PlusCircle, CreditCard, Tag, CalendarDays, MoreVertical, TrendingDown, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CreateCouponModal } from "./CreateCouponModal"
import { ConfigurePercentageModal } from "./ConfigurePercentageModal"
import { toggleCoupon, deleteCoupon } from "./actions"

export function CouponsClient({ initialCoupons, metrics, plans }: { initialCoupons: any[], metrics: any, plans: { id: string, name: string, priceMonthly: number, priceYearly: number }[] }) {
    const [isPending, startTransition] = React.useTransition()

    const averageDiscount = React.useMemo(() => {
        if (plans.length === 0) return 16; // strict fallback
        return plans.reduce((acc, plan) => {
            const expectedYearly = plan.priceMonthly * 12;
            if (expectedYearly === 0) return acc;
            return acc + ((expectedYearly - plan.priceYearly) / expectedYearly) * 100;
        }, 0) / plans.length;
    }, [plans]);

    const displayDiscount = Math.round(averageDiscount);

    return (
        <div className="flex flex-col h-full bg-slate-50/50">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b bg-white shrink-0">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 border-l-4 border-primary pl-3">Discounts & Coupons</h1>
                    <p className="text-sm text-slate-500 mt-1 pl-4">Manage promotional codes, automated discounts, and marketing campaigns.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-10 border-slate-200">
                        <TrendingDown className="h-4 w-4 mr-2 text-slate-500" />
                        View Finance Report
                    </Button>
                    <CreateCouponModal plans={plans} />
                </div>
            </div>

            {/* Metrics */}
            <div className="px-8 py-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Coupons</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">{metrics.activeCoupons}</h3>
                        </div>
                        <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
                            <Ticket className="h-5 w-5 text-emerald-600" />
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Redemptions</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">{metrics.totalRedemptions}</h3>
                        </div>
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Discount Given</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">₹{Math.round(Number(metrics.discountGiven)).toLocaleString()}</h3>
                        </div>
                        <div className="h-10 w-10 bg-rose-100 rounded-full flex items-center justify-center">
                            <TrendingDown className="h-5 w-5 text-rose-600" />
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Expiring Soon</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">{metrics.expiringSoon}</h3>
                        </div>
                        <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center">
                            <CalendarDays className="h-5 w-5 text-amber-600" />
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="coupons" className="w-full">
                    <TabsList className="bg-white border p-1 rounded-xl shadow-sm h-auto inline-flex mb-6">
                        <TabsTrigger value="coupons" className="px-6 py-2.5 rounded-lg text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">Coupon Codes</TabsTrigger>
                        <TabsTrigger value="automatic" className="px-6 py-2.5 rounded-lg text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">Automatic Discounts</TabsTrigger>
                        <TabsTrigger value="campaigns" className="px-6 py-2.5 rounded-lg text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">Marketing Campaigns</TabsTrigger>
                    </TabsList>

                    <TabsContent value="coupons" className="space-y-4">
                        <div className="flex items-center gap-3 mb-6 bg-white p-2 rounded-xl shadow-sm border w-full max-w-md">
                            <Search className="h-4 w-4 text-slate-400 ml-2 shrink-0" />
                            <Input placeholder="Search coupons by code or ID..." className="border-0 shadow-none focus-visible:ring-0 px-0 h-9" />
                        </div>

                        {initialCoupons.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed rounded-xl bg-white">
                                <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                    <Ticket className="h-8 w-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900">No active coupons</h3>
                                <p className="text-sm text-slate-500 max-w-sm mt-1">Create promotional codes to offer targeted discounts to your businesses.</p>
                                <Button className="mt-6 bg-primary">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Create First Coupon
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {initialCoupons.map((coupon) => (
                                    <div key={coupon.id} className="relative bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />

                                        {/* Ticket Cutout Effect */}
                                        <div className="absolute top-1/2 -left-2 w-4 h-4 bg-slate-50 border-r border-slate-200 rounded-full -translate-y-1/2" />
                                        <div className="absolute top-1/2 -right-2 w-4 h-4 bg-slate-50 border-l border-slate-200 rounded-full -translate-y-1/2" />

                                        <div className="p-5 border-b border-dashed border-slate-200 flex justify-between items-start">
                                            <div>
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-mono text-sm font-semibold border border-slate-200 shadow-inner">
                                                    <Ticket className="h-3.5 w-3.5" />
                                                    {coupon.code}
                                                </div>
                                                <h3 className="text-2xl font-bold text-slate-900 mt-4 leading-none">
                                                    {coupon.type === 'percentage' ? `${Math.round(Number(coupon.value))}% OFF` : `₹${Math.round(Number(coupon.value))} OFF`}
                                                </h3>
                                                <p className="text-sm text-slate-500 mt-1">
                                                    {coupon.minPurchase ? `Min. purchase: ₹${Math.round(Number(coupon.minPurchase))}` : 'No minimum purchase'}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${coupon.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                                                    {coupon.status === 'active' ? 'Active 🟢' : coupon.status}
                                                </span>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" disabled={isPending} />}>
                                                        <MoreVertical className="h-4 w-4" />
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => startTransition(() => { toggleCoupon(coupon.id) })}>
                                                            {coupon.status === 'active' ? 'Disable Coupon' : 'Enable Coupon'}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => startTransition(() => { deleteCoupon(coupon.id) })} className="text-destructive focus:bg-destructive focus:text-destructive-foreground">
                                                            Delete Coupon
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>

                                        <div className="p-5 bg-slate-50/50 flex-1 space-y-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-500 flex items-center gap-2"><Tag className="h-3.5 w-3.5" /> Applies to</span>
                                                <span className="font-medium text-slate-900">
                                                    {Array.isArray(coupon.appliesTo) && coupon.appliesTo.includes('all') ? 'All Plans' : 'Selected Plans'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-500 flex items-center gap-2"><CreditCard className="h-3.5 w-3.5" /> Duration</span>
                                                <span className="font-medium text-slate-900">
                                                    {coupon.duration === 'first_payment' ? 'First payment' : coupon.duration === 'forever' ? 'Forever' : `First ${coupon.durationInMonths} months`}
                                                </span>
                                            </div>
                                            <div className="relative pt-3 mt-1">
                                                <div className="flex items-center justify-between text-xs mb-1.5">
                                                    <span className="text-slate-500">Used: {coupon.usedRedemptions} / {coupon.maxRedemptions || '∞'}</span>
                                                    <span className="text-slate-500">
                                                        {coupon.validUntil ? `Expires: ${new Date(coupon.validUntil).toLocaleDateString()}` : 'No expiry'}
                                                    </span>
                                                </div>
                                                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary rounded-full" style={{ width: coupon.maxRedemptions ? `${(coupon.usedRedemptions / coupon.maxRedemptions) * 100}%` : '5%' }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="automatic" className="space-y-4">
                        <div className="bg-white p-6 rounded-xl border shadow-sm mb-4">
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">Annual Billing Discount</h3>
                            <p className="text-sm text-slate-500 max-w-2xl">This discount is automatically applied to businesses when they choose yearly billing on the pricing page. It is pre-configured and does not require a coupon code.</p>
                            <div className="mt-6 flex items-center gap-6 p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
                                <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                                    <TrendingDown className="h-6 w-6 text-emerald-600" />
                                </div>
                                <div>
                                    <div className="text-sm text-emerald-600 font-medium">Global Rule Active</div>
                                    <div className="text-2xl font-bold text-emerald-900">Save {displayDiscount}% on Annual Plans</div>
                                </div>
                                <ConfigurePercentageModal currentPercentage={displayDiscount} />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="campaigns" className="space-y-4">
                        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed rounded-xl bg-white">
                            <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                <Tag className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">No active promotional campaigns</h3>
                            <p className="text-sm text-slate-500 max-w-sm mt-1">Bundle multiple discounts together for seasonal promotions like Black Friday or Holiday sales.</p>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
