"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, User, Users, Star, QrCode, TrendingUp, CreditCard, Settings, Activity } from "lucide-react";

export function BusinessNav({ businessId }: { businessId: string }) {
    const pathname = usePathname();

    const links = [
        { name: "Overview", href: `/superadmin/businesses/${businessId}`, icon: LayoutDashboard },
        { name: "Profile", href: `/superadmin/businesses/${businessId}/profile`, icon: User },
        { name: "Users & Access", href: `/superadmin/businesses/${businessId}/users`, icon: Users },
        { name: "Reviews", href: `/superadmin/businesses/${businessId}/reviews`, icon: Star },
        { name: "QR Campaigns", href: `/superadmin/businesses/${businessId}/campaigns`, icon: QrCode },
        { name: "Analytics & Usage", href: `/superadmin/businesses/${businessId}/analytics`, icon: TrendingUp },
        { name: "Billing & Subscription", href: `/superadmin/businesses/${businessId}/billing`, icon: CreditCard },
        { name: "Settings & Overrides", href: `/superadmin/businesses/${businessId}/settings`, icon: Settings },
        { name: "Activity / Audit", href: `/superadmin/businesses/${businessId}/audit`, icon: Activity },
    ];

    return (
        <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1 bg-white p-3 rounded-xl border border-slate-200">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3 pt-2">Menu</h3>
            {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                            "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                            isActive
                                ? "bg-emerald-50 text-emerald-700"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        )}
                    >
                        <link.icon className={cn(
                            "mr-3 h-4 w-4 flex-shrink-0 transition-colors",
                            isActive ? "text-emerald-700" : "text-slate-400 group-hover:text-slate-500"
                        )} />
                        {link.name}
                    </Link>
                );
            })}
        </nav>
    );
}
