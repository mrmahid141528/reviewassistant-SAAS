"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Building, Star, Sparkles, Bell, Users, Shield, LucideIcon } from "lucide-react"

const settingsNav = [
    { name: "Business", href: "/dashboard/settings/business", icon: Building },
    { name: "Review Experience", href: "/dashboard/settings/review-experience", icon: Star },
    { name: "AI Assistant", href: "/dashboard/settings/ai-assistant", icon: Sparkles },
    { name: "Notifications", href: "/dashboard/settings/notifications", icon: Bell },
    { name: "Team & Permissions", href: "/dashboard/settings/team", icon: Users },
    { name: "Security", href: "/dashboard/settings/security", icon: Shield },
]

export function SettingsNav({ role }: { role?: string }) {
    const pathname = usePathname()

    // Filter Navigation based on role
    const filteredSettingsNav = settingsNav.filter(item => {
        if (role === "manager" || role === "viewer") {
            const allowed = ["Review Experience", "AI Assistant"];
            if (!allowed.includes(item.name)) return false;
        }
        return true;
    });

    return (
        <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1 overflow-x-auto px-4 lg:px-0 pb-2">
            {filteredSettingsNav.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                            isActive
                                ? "bg-indigo-600 text-white shadow-md hover:bg-indigo-700"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        )}
                    >
                        <Icon className="h-4 w-4" />
                        {item.name}
                    </Link>
                )
            })}
        </nav>
    )
}
