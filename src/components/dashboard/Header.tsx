"use client";

import { Menu, LayoutDashboard, MessageSquare, MapPin, QrCode, Settings, CreditCard, Store, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from "@/components/ui/sheet";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const navigation = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Questions", href: "/dashboard/questions", icon: MessageSquare },
    { name: "Locations", href: "/dashboard/locations", icon: MapPin },
    { name: "QR Code", href: "/dashboard/qr", icon: QrCode },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
    { name: "Billing & Plans", href: "/dashboard/billing", icon: CreditCard },
];

export function Header() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    };
    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
            <Sheet>
                <SheetTrigger render={<Button variant="outline" size="icon" className="md:hidden" aria-label="Toggle Menu" />}>
                    <Menu className="h-5 w-5" />
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    <div className="flex h-full w-full flex-col gap-4 border-r bg-muted/40 p-4">
                        <div className="flex items-center gap-2 px-2 pb-4 pt-2">
                            <div className="p-1.5 bg-blue-600/10 rounded-lg">
                                <Store className="h-5 w-5 text-blue-600" />
                            </div>
                            <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">Review Assistant</span>
                        </div>

                        <nav className="flex-1 space-y-1">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                            isActive
                                                ? "bg-blue-600/10 text-blue-700 font-semibold shadow-sm"
                                                : "text-gray-500 hover:bg-gray-100/80 hover:text-gray-900 hover:translate-x-1"
                                        )}
                                    >
                                        <item.icon className="h-4 w-4" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="mt-auto space-y-2">
                            <button
                                onClick={handleLogout}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 transition-all duration-200 hover:bg-red-50 hover:text-red-600 hover:translate-x-1"
                            >
                                <LogOut className="h-4 w-4" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            <div className="flex-1">
                <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
                    Dashboard
                </h1>
            </div>

            <div className="flex items-center gap-4">
                {/* Placeholder for future User Profile Menu */}
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-xs text-primary">
                    MR
                </div>
            </div>
        </header>
    );
}
