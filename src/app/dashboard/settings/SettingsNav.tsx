"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Building, Star, Sparkles, Bell, Users, Shield, LucideIcon, ChevronDown } from "lucide-react"

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

    const router = useRouter()

    return (
        <div className="w-full">
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex lg:flex-col lg:space-y-1 pb-2">
                {filteredSettingsNav.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            {/* Mobile Navigation Dropdown */}
            <div className="lg:hidden px-4 mb-6 relative">
                <select
                    className="w-full h-12 pl-4 pr-10 border rounded-lg bg-card text-foreground appearance-none shadow-sm focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium"
                    value={pathname}
                    onChange={(e) => router.push(e.target.value)}
                >
                    {filteredSettingsNav.map((item) => (
                        <option key={item.href} value={item.href}>
                            {item.name}
                        </option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-7 flex items-center pointer-events-none">
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
            </div>
        </div>
    )
}
