"use client";
// Force Turbopack Cache Invalidation for Client Component Boundary

import React from "react";
import { Search, Bell, UserCircle, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { SuperadminCommandPalette } from "./SuperadminCommandPalette";
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { SuperadminSidebar } from "./SuperadminSidebar";

interface SuperadminHeaderProps {
    adminEmail?: string;
}

export function SuperadminHeader({ adminEmail = "Admin" }: SuperadminHeaderProps) {
    const router = useRouter();
    const [open, setOpen] = React.useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    return (
        <header className="h-16 flex items-center justify-between px-4 sm:px-8 border-b bg-white shrink-0 gap-2">
            {/* Mobile Sidebar Trigger */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger render={
                    <Button variant="ghost" size="icon" className="md:hidden flex h-9 w-9 items-center justify-center rounded-md hover:bg-slate-100 transition-colors">
                        <Menu className="h-5 w-5 text-slate-600" />
                    </Button>
                }>
                    <Menu className="h-5 w-5 text-slate-600" />
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] p-0 border-r-0">
                    <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                    {/* Render the actual sidebar content inside the sheet for mobile */}
                    <div className="w-full flex-shrink-0 bg-white flex flex-col h-full">
                        <SuperadminSidebar onNavClick={() => setMobileMenuOpen(false)} className="flex md:flex w-full h-full border-r-0" />
                    </div>
                </SheetContent>
            </Sheet>

            {/* Global Search */}
            <div className="flex-1 max-w-xl relative">
                <Button
                    variant="outline"
                    className="w-full relative h-9 justify-start text-sm text-slate-500 bg-slate-50 border-slate-200 hover:bg-slate-100 rounded-full px-4"
                    onClick={() => setOpen(true)}
                >
                    <Search className="mr-2 h-4 w-4" />
                    <span>Search anything... (Businesses, Payments...)</span>
                    <kbd className="pointer-events-none absolute right-3 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                        <span className="text-xs">⌘</span>K
                    </kbd>
                </Button>
            </div>

            <SuperadminCommandPalette open={open} setOpen={setOpen} />

            {/* Right Actions */}
            <div className="flex items-center sm:gap-4 ml-2">
                <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900 rounded-full flex">
                    <Bell className="h-5 w-5" />
                </Button>

                <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-slate-200">
                    <div className="flex flex-col items-end hidden sm:flex">
                        <span className="text-sm font-semibold text-slate-900 leading-tight">Superadmin</span>
                        <span className="text-xs text-slate-500 leading-tight">{adminEmail}</span>
                    </div>
                    <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                        <UserCircle className="h-6 w-6" />
                    </div>
                </div>
            </div>
        </header>
    );
}
