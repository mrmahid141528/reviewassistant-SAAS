"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, List, Activity, TrendingUp, Flag } from "lucide-react";

export default function ReviewsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const tabs = [
        { name: "Overview", href: "/superadmin/reviews", icon: LayoutDashboard },
        { name: "All Reviews", href: "/superadmin/reviews/all", icon: List },
        { name: "Review Activity", href: "/superadmin/reviews/activity", icon: Activity },
        { name: "Conversion", href: "/superadmin/reviews/conversion", icon: TrendingUp },
        { name: "Flagged Activity", href: "/superadmin/reviews/flagged", icon: Flag },
    ];

    return (
        <div className="flex flex-1 flex-col p-4 md:p-8 overflow-y-auto">
            <div className="flex flex-col gap-1 mb-6">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Reviews & Funnel Analytics</h1>
                <p className="text-slate-500">
                    SaaS-wide control center for monitoring platform review generation performance, activity feeds, and security.
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-64 shrink-0 transition-all border-b md:border-b-0 md:border-r border-slate-200 pr-0 md:pr-4 pb-4 md:pb-0">
                    <nav className="flex flex-col space-y-1" aria-label="Tabs">
                        {tabs.map((tab) => {
                            const isActive = pathname === tab.href || (pathname.startsWith(tab.href + "/") && tab.href !== "/superadmin/reviews");
                            return (
                                <Link
                                    key={tab.name}
                                    href={tab.href}
                                    className={cn(
                                        isActive
                                            ? "bg-slate-100 text-slate-900 font-semibold"
                                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200"
                                    )}
                                >
                                    <tab.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-slate-900" : "text-slate-400")} />
                                    {tab.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="flex-1 w-full min-w-0">
                    {children}
                </div>
            </div>
        </div>
    );
}
