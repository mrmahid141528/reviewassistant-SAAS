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
    HelpCircle
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";

const platformNavItems = [
    { name: "Overview", href: "/superadmin", icon: LayoutDashboard },
    { name: "Businesses", href: "/superadmin/businesses", icon: Building2 },
    { name: "Analytics", href: "/superadmin/analytics", icon: BarChart3 },
    { name: "Reviews", href: "/superadmin/reviews", icon: Star },
    { name: "QR Campaigns", href: "/superadmin/campaigns", icon: QrCode },
    { name: "Support Hub", href: "/superadmin/support", icon: HelpCircle },
];

const monetizationNavItems = [
    { name: "Billing", href: "/superadmin/billing", icon: CreditCard },
    { name: "Pricing Plans", href: "/superadmin/pricing", icon: DollarSign },
    { name: "Discounts & Coupons", href: "/superadmin/coupons", icon: Ticket },
];

const systemNavItems = [
    { name: "Security", href: "/superadmin/security", icon: ShieldAlert },
    { name: "Audit Logs", href: "/superadmin/audit", icon: History },
    { name: "Notifications", href: "/superadmin/notifications", icon: Bell },
    { name: "System", href: "/superadmin/system", icon: Settings },
    { name: "Legal", href: "/superadmin/pages", icon: FileText },
    { name: "Data Control", href: "/superadmin/data", icon: Database },
    { name: "Admins", href: "/superadmin/admins", icon: UserCog },
];

export function SuperadminSidebar({ className, onNavClick }: { className?: string, onNavClick?: () => void }) {
    const pathname = usePathname();

    const renderLink = (item: any) => {
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
                    <div className="h-6 w-6 bg-slate-900 rounded-md flex items-center justify-center">
                        <ShieldAlert className="h-3 w-3 text-white" />
                    </div>
                    SaaS Control
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
