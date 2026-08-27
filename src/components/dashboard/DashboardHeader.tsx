"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ChevronDown, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface DashboardHeaderProps {
    userName: string;
    locations?: { id: string, name: string }[];
}

export function DashboardHeader({ userName, locations = [] }: DashboardHeaderProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const greeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return 'Good morning'
        if (hour < 18) return 'Good afternoon'
        return 'Good evening'
    }

    const currentRange = searchParams.get('range') || '30d';
    const currentLocation = searchParams.get('locationId') || 'all';

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === 'all') params.delete(key);
        else params.set(key, value);
        router.push(`${pathname}?${params.toString()}`);
    }

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    {greeting()}, {userName} 👋
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    Here's how your review activity is performing right now.
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                {locations.length > 1 && (
                    <div className="relative hidden sm:block">
                        <MapPin className="absolute left-2.5 top-2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                        <select
                            className="appearance-none bg-card border rounded-md text-sm pl-8 pr-8 py-1.5 text-foreground font-medium outline-none focus:ring-1 focus:ring-primary cursor-pointer hover:bg-muted/50 transition-colors"
                            value={currentLocation}
                            onChange={(e) => updateFilter('locationId', e.target.value)}
                        >
                            <option value="all">All Locations</option>
                            {locations.map(loc => (
                                <option key={loc.id} value={loc.id}>{loc.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-2.5 w-3 h-3 text-muted-foreground pointer-events-none" />
                    </div>
                )}

                <div className="relative hidden sm:block">
                    <select
                        className="appearance-none bg-card border rounded-md text-sm pl-3 pr-8 py-1.5 text-muted-foreground outline-none focus:ring-1 focus:ring-primary cursor-pointer hover:bg-muted/50 transition-colors"
                        value={currentRange}
                        onChange={(e) => updateFilter('range', e.target.value)}
                    >
                        <option value="regex">Today</option>
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="year">Past Year</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-2.5 w-3 h-3 text-muted-foreground pointer-events-none" />
                </div>

                <Link href="/dashboard/qr">
                    <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm ml-1">
                        <Plus className="mr-2 w-4 h-4" /> Create QR
                    </Button>
                </Link>
            </div>
        </div>
    );
}
