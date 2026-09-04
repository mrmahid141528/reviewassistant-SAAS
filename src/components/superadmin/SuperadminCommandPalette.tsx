"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
    Building,
    QrCode,
    CreditCard,
    TicketPercent,
    ExternalLink,
    Search,
    Loader2,
    ShieldAlert,
    Key
} from "lucide-react"

import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"

export function SuperadminCommandPalette({ open, setOpen }: { open: boolean, setOpen: (val: boolean) => void }) {
    const router = useRouter()
    const [query, setQuery] = React.useState("")
    const [loading, setLoading] = React.useState(false)
    const [results, setResults] = React.useState<any>({
        businesses: [],
        campaigns: [],
        payments: [],
        coupons: []
    })

    // Debounce the typed query
    React.useEffect(() => {
        if (!query || query.length < 2) {
            setResults({ businesses: [], campaigns: [], payments: [], coupons: [] })
            setLoading(false)
            return
        }

        setLoading(true)
        const delayBounceFn = setTimeout(async () => {
            const systemLinks = [
                { title: "Security Settings", href: "/superadmin/security", icon: ShieldAlert, description: "Manage platform security policies" },
                { title: "Audit & Compliance", href: "/superadmin/audit", icon: ShieldAlert, description: "Review immutable security audit logs" },
                { title: "API Keys & Connections", href: "/superadmin/system/api-keys", icon: Key, description: "Manage AI and provider integrations" },
                { title: "Data Control", href: "/superadmin/data", icon: ShieldAlert, description: "Manage tenant data operations" },
            ];
            try {
                const res = await fetch(`/api/superadmin/search?q=${encodeURIComponent(query)}`)
                const data = await res.json()
                setResults(data)
            } catch (error) {
                console.error("Failed to fetch search results", error)
            } finally {
                setLoading(false)
            }
        }, 300) // 300ms debounce

        return () => clearTimeout(delayBounceFn)
    }, [query])

    const runCommand = React.useCallback((command: () => void) => {
        setOpen(false)
        command()
    }, [setOpen])

    const hasResults = Object.values(results).some((arr: any) => arr.length > 0)

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <Command shouldFilter={false}>
                <CommandInput
                    placeholder="Search anything... (Businesses, Payments, Campaigns...)"
                    value={query}
                    onValueChange={setQuery}
                />

                <CommandList>
                    {loading && (
                        <div className="flex items-center justify-center p-6 text-slate-500 gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">Searching ecosystem...</span>
                        </div>
                    )}

                    {!loading && !hasResults && query.length >= 2 && (
                        <CommandEmpty>No results found for "{query}".</CommandEmpty>
                    )}
                    {!loading && query.length < 2 && (
                        <div className="py-14 text-center text-sm text-slate-500">
                            <Search className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                            <p>Search by business, payment, QR, or coupon</p>
                        </div>
                    )}

                    {results.businesses?.length > 0 && (
                        <CommandGroup heading="Businesses">
                            {results.businesses.map((biz: any) => (
                                <CommandItem
                                    key={biz.id}
                                    value={`biz-${biz.id}`}
                                    onSelect={() => runCommand(() => router.push(`/superadmin/businesses/${biz.id}`))}
                                    className="flex items-start gap-3 py-3 object-contain items-center"
                                >
                                    <div className="h-8 w-8 bg-emerald-100 text-emerald-700 rounded flex items-center justify-center shrink-0">
                                        <Building className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-sm font-semibold text-slate-900 truncate flex items-center gap-2">
                                            {biz.name}
                                            <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-bold ${biz.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                                {biz.status}
                                            </span>
                                        </p>
                                        <p className="text-xs text-slate-500 truncate mt-0.5 font-mono">
                                            {biz.subscriptions?.[0]?.plan?.name || 'No Plan'} · {biz.id}
                                        </p>
                                    </div>
                                    <ExternalLink className="h-4 w-4 text-slate-300" />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    {results.campaigns?.length > 0 && (
                        <>
                            {hasResults && <CommandSeparator />}
                            <CommandGroup heading="QR Campaigns">
                                {results.campaigns.map((camp: any) => (
                                    <CommandItem
                                        key={camp.id}
                                        value={`camp-${camp.id}`}
                                        onSelect={() => runCommand(() => router.push(`/superadmin/businesses/${camp.businessId}`))}
                                        className="flex items-start gap-3 py-3 object-contain items-center"
                                    >
                                        <div className="h-8 w-8 bg-purple-100 text-purple-700 rounded flex items-center justify-center shrink-0">
                                            <QrCode className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="text-sm font-semibold text-slate-900 truncate">
                                                {camp.business?.name} - {camp.name}
                                            </p>
                                            <p className="text-xs text-slate-500 truncate mt-0.5">
                                                {camp.status} · {camp._count?.feedbackSubmissions || 0} scans
                                            </p>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </>
                    )}

                    {results.payments?.length > 0 && (
                        <>
                            {hasResults && <CommandSeparator />}
                            <CommandGroup heading="Recent Transactions">
                                {results.payments.map((payment: any) => (
                                    <CommandItem
                                        key={payment.id}
                                        value={`pay-${payment.id}`}
                                        onSelect={() => runCommand(() => router.push(`/superadmin/businesses/${payment.businessId}`))}
                                        className="flex items-start gap-3 py-3 object-contain items-center"
                                    >
                                        <div className="h-8 w-8 bg-amber-100 text-amber-700 rounded flex items-center justify-center shrink-0">
                                            <CreditCard className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="text-sm font-semibold text-slate-900 truncate">
                                                ₹{Math.round(Number(payment.amount))} · <span className="capitalize">{payment.status}</span>
                                            </p>
                                            <p className="text-xs text-slate-500 truncate mt-0.5">
                                                {payment.business?.name} · {payment.providerPaymentId}
                                            </p>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </>
                    )}

                    {results.coupons?.length > 0 && (
                        <>
                            {hasResults && <CommandSeparator />}
                            <CommandGroup heading="Coupons & Discounts">
                                {results.coupons.map((coupon: any) => (
                                    <CommandItem
                                        key={coupon.id}
                                        value={`coup-${coupon.id}`}
                                        onSelect={() => runCommand(() => router.push(`/superadmin/coupons`))}
                                        className="flex items-start gap-3 py-3 object-contain items-center"
                                    >
                                        <div className="h-8 w-8 bg-rose-100 text-rose-700 rounded flex items-center justify-center shrink-0">
                                            <TicketPercent className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="text-sm font-semibold text-slate-900 truncate flex items-center gap-2">
                                                {coupon.code}
                                                <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-bold ${coupon.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                                    {coupon.status}
                                                </span>
                                            </p>
                                            <p className="text-xs text-slate-500 truncate mt-0.5">
                                                {coupon.type === 'percentage' ? `${Math.round(Number(coupon.value))}% OFF` : `₹${Math.round(Number(coupon.value))} OFF`} · {coupon.usedRedemptions} used
                                            </p>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </>
                    )}

                </CommandList>
            </Command>
        </CommandDialog>
    )
}
