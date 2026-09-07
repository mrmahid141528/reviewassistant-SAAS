"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Building2,
    BarChart3,
    Star,
    QrCode,
    CreditCard,
    DollarSign,
    Ticket,
    ShieldAlert,
    History,
    Bell,
    Settings,
    FileText,
    Database,
    UserCog,
    LogOut,
    HelpCircle,
    Palette,
    Key,
    ChevronDown
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import React, { useState, useEffect } from "react";

const platformNavItems = [
    { name: "Overview", href: "/superadmin", icon: LayoutDashboard },
    { name: "Businesses", href: "/superadmin/businesses", icon: Building2 },
    {
        name: "Platform Content",
        icon: Palette,
        subItems: [
            { name: "SaaS Branding", href: "/superadmin/branding" },
            { name: "Support Hub", href: "/superadmin/support" },
        ]
    },
    {
        name: "Analytics & Data",
        icon: BarChart3,
        subItems: [
            { name: "Superadmin Analytics", href: "/superadmin/analytics" },
            { name: "Platform Reviews", href: "/superadmin/reviews" },
            { name: "QR Campaigns", href: "/superadmin/campaigns" },
        ]
    }
];

const monetizationNavItems = [
    {
        name: "Monetization",
        icon: CreditCard,
        subItems: [
            { name: "Billing Hub", href: "/superadmin/billing" },
            { name: "Payment Requests", href: "/superadmin/billing/requests" },
            { name: "Pricing Plans", href: "/superadmin/pricing" },
            { name: "Discounts & Coupons", href: "/superadmin/coupons" },
        ]
    }
];

const systemNavItems = [
    {
        name: "System Settings",
        icon: Settings,
        subItems: [
            { name: "General System", href: "/superadmin/system" },
            { name: "API Keys", href: "/superadmin/system/api-keys" },
            { name: "Legal Pages", href: "/superadmin/pages" },
        ]
    },
    {
        name: "Security & Control",
        icon: ShieldAlert,
        subItems: [
            { name: "Security Audit", href: "/superadmin/security" },
            { name: "Audit Logs", href: "/superadmin/audit" },
            { name: "Data Control", href: "/superadmin/data" },
        ]
    },
    { name: "Notifications", href: "/superadmin/notifications", icon: Bell },
    { name: "Admins", href: "/superadmin/admins", icon: UserCog },
];

export function SuperadminSidebar({ className, onNavClick, brandSettings }: { className?: string, onNavClick?: () => void, brandSettings?: { platformName?: string, logoUrl?: string | null } }) {
    const pathname = usePathname();
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const newOpenMenus = { ...openMenus };
        let changed = false;

        [...platformNavItems, ...monetizationNavItems, ...systemNavItems].forEach(item => {
            if (item.subItems?.some(s => pathname === s.href || pathname.startsWith(`${s.href}/`))) {
                if (!newOpenMenus[item.name]) {
                    newOpenMenus[item.name] = true;
                    changed = true;
                }
            }
        });

        if (changed) setOpenMenus(newOpenMenus);
    }, [pathname]);

    const renderLink = (item: any) => {
        if (item.subItems) {
            const isOpen = openMenus[item.name] || false;
            const hasActiveChild = item.subItems.some((s: any) => pathname === s.href || pathname.startsWith(`${s.href}/`));

            return (
                <div key={item.name} className="flex flex-col gap-1 w-full relative">
                    <button
                        onClick={() => setOpenMenus(prev => ({ ...prev, [item.name]: !isOpen }))}
                        className={cn(
                            buttonVariants({ variant: "ghost" }),
                            "w-full justify-between gap-3 h-9 text-[13px] font-medium transition-colors cursor-pointer",
                            hasActiveChild ? "bg-slate-100 text-slate-900 shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <item.icon className={cn("h-4 w-4 shrink-0", hasActiveChild ? "text-slate-900" : "text-slate-500")} />
                            <span className="truncate">{item.name}</span>
                        </div>
                        <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform duration-200 shrink-0", isOpen && "rotate-180")} />
                    </button>

                    <div className={cn("flex flex-col gap-1 overflow-hidden transition-all duration-300 ml-5 pl-2 border-l border-slate-200", isOpen ? "max-h-[500px] opacity-100 mt-1" : "max-h-0 opacity-0")}>
                        {item.subItems.map((sub: any) => {
                            const isSubActive = pathname === sub.href;
                            return (
                                <Link
                                    key={sub.name}
                                    href={sub.href}
                                    onClick={onNavClick}
                                    className={cn(
                                        buttonVariants({ variant: "ghost" }),
                                        "w-full justify-start h-8 text-[12px] font-medium transition-colors",
                                        isSubActive ? "bg-slate-900 text-white hover:bg-slate-800 hover:text-white shadow-sm" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                    )}
                                >
                                    <span className="truncate">{sub.name}</span>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )
        }

        const isActive = pathname === item.href;
        return (
            <Link
                key={item.name}
                href={item.href}
                onClick={onNavClick}
                className={cn(
                    buttonVariants({ variant: "ghost" }),
                    "w-full justify-start gap-3 h-9 text-[13px] font-medium transition-colors",
                    isActive ? "bg-slate-900 text-white hover:bg-slate-800 hover:text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
            >
                <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-slate-200" : "text-slate-500")} />
                <span className="truncate">{item.name}</span>
            </Link>
        );
    };

    return (
        <aside className={cn("w-64 flex-shrink-0 border-r bg-white hidden md:flex flex-col h-screen", className)}>
            <div className="h-16 flex items-center px-6 border-b shrink-0">
                <span className="font-bold text-lg text-slate-900 flex items-center gap-2">
                    {brandSettings?.logoUrl ? (
                        <div className="flex items-center justify-start h-16 w-full -ml-3">
                            <img src={brandSettings.logoUrl} alt="Platform Logo" className="h-full object-contain max-h-16 w-auto" />
                        </div>
                    ) : (
                        <div className="h-6 w-6 bg-slate-900 rounded-md flex items-center justify-center">
                            <ShieldAlert className="h-3 w-3 text-white" />
                        </div>
                    )}
                </span>
            </div>

            <div className="flex-1 py-4 px-3 overflow-y-auto">
                <div className="space-y-6">
                    <div className="space-y-1">
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">Platform Management</h4>
                        {platformNavItems.map(renderLink)}
                    </div>

                    <div className="space-y-1">
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">Monetization</h4>
                        {monetizationNavItems.map(renderLink)}
                    </div>

                    <div className="space-y-1">
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">System & Data</h4>
                        {systemNavItems.map(renderLink)}
                    </div>
                </div>
            </div>

            <div className="p-4 border-t space-y-1 shrink-0 bg-slate-50/50">
                <Link
                    href="/superadmin/settings"
                    onClick={onNavClick}
                    className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start gap-3 h-9 text-[13px] font-medium text-slate-600 hover:bg-slate-200 hover:text-slate-900")}
                >
                    <Settings className="h-4 w-4 shrink-0 text-slate-500" /> <span className="truncate">Profile Settings</span>
                </Link>
                <Link
                    href="/dashboard"
                    onClick={onNavClick}
                    className={cn(buttonVariants({ variant: "outline" }), "w-full gap-2 h-9 text-[13px] text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-slate-200 shadow-sm")}
                >
                    <LogOut className="h-4 w-4 shrink-0 text-slate-500" /> Exit Portal
                </Link>
            </div>
        </aside>
    );
}
