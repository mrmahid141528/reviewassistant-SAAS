"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Briefcase, BarChart3, Zap, CreditCard, FileText, History } from "lucide-react"

const billingNav = [
    { name: "Current Subscription", href: "/dashboard/billing/subscription", icon: Briefcase },
    { name: "Usage & Limits", href: "/dashboard/billing/usage", icon: BarChart3 },
    { name: "Plans & Pricing", href: "/dashboard/billing/plans", icon: Zap },
    { name: "Payment Method", href: "/dashboard/billing/payment-method", icon: CreditCard },
    { name: "Billing Information", href: "/dashboard/billing/billing-info", icon: FileText },
    { name: "Billing History", href: "/dashboard/billing/history", icon: History },
]

export function BillingNav({ role }: { role?: string }) {
    const pathname = usePathname()

    return (
        <nav className="flex flex-col space-y-2">
            {billingNav.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 border",
                            isActive
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-md scale-[1.02]"
                                : "bg-white text-slate-500 border-transparent hover:bg-slate-50 hover:text-slate-900 hover:border-slate-200"
                        )}
                    >
                        <Icon className={cn("h-4 w-4 shrink-0 transition-colors", isActive ? "text-white" : "text-slate-400")} />
                        {item.name}
                    </Link>
                )
            })}
        </nav>
    )
}
