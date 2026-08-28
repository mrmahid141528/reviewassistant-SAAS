"use client";

import { Menu, LayoutDashboard, MessageSquare, MapPin, QrCode, Settings, CreditCard, Store, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from "@/components/ui/sheet";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

import { Sidebar } from "./Sidebar";

import React from "react";

export function Header({ userAvatar, userNameInitials, role }: { userAvatar?: string | null, userNameInitials?: string, role?: string }) {
    const pathname = usePathname();
    const router = useRouter();
    const [open, setOpen] = React.useState(false);

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    };
    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger render={<Button variant="outline" size="icon" className="md:hidden" aria-label="Toggle Menu" />}>
                    <Menu className="h-5 w-5" />
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] p-0 border-r-0">
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    <Sidebar role={role} onNavClick={() => setOpen(false)} className="flex md:flex w-full h-full pb-12 border-r-0 shadow-none border-none" />
                </SheetContent>
            </Sheet>

            <div className="flex-1">
                <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
                    Dashboard
                </h1>
            </div>

            <div className="flex items-center gap-4">
                <Link href="/dashboard/profile" className="transition-transform hover:scale-105 active:scale-95">
                    <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-sm text-primary overflow-hidden shadow-sm">
                        {userAvatar ? (
                            <img src={userAvatar} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                            userNameInitials || "MR"
                        )}
                    </div>
                </Link>
            </div>
        </header>
    );
}
