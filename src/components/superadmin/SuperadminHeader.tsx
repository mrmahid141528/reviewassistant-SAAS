"use client";
// Force Turbopack Cache Invalidation for Client Component Boundary

import React from "react";
import { Search, Bell, UserCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { SuperadminCommandPalette } from "./SuperadminCommandPalette";

interface SuperadminHeaderProps {
    adminEmail?: string;
}

export function SuperadminHeader({ adminEmail = "Admin" }: SuperadminHeaderProps) {
    const router = useRouter();
    const [open, setOpen] = React.useState(false);

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
        <header className="h-16 flex items-center justify-between px-8 border-b bg-white shrink-0">
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
            <div className="flex items-center gap-4 ml-4">
                <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900 rounded-full hidden sm:flex">
                    <Bell className="h-5 w-5" />
                </Button>

                <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
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
