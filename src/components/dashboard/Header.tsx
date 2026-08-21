"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
            <Button variant="outline" size="icon" className="md:hidden" aria-label="Toggle Menu">
                <Menu className="h-5 w-5" />
            </Button>

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
