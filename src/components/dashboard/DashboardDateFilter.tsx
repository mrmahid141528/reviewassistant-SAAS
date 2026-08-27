"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarIcon, Filter } from "lucide-react";

export function DashboardDateFilter() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const initialRange = searchParams.get('range') || '30d';
    const initialFrom = searchParams.get('from') || '';
    const initialTo = searchParams.get('to') || '';

    const [range, setRange] = useState(initialRange);
    const [from, setFrom] = useState(initialFrom);
    const [to, setTo] = useState(initialTo);

    const applyFilter = (key: string, val: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set(key, val);
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleRangeSelect = (value: string | null) => {
        if (!value) return;
        setRange(value);
        if (value !== 'custom') {
            const params = new URLSearchParams(searchParams.toString());
            params.set('range', value);
            params.delete('from');
            params.delete('to');
            router.push(`${pathname}?${params.toString()}`);
        }
    };

    const applyCustomRange = () => {
        if (!from || !to) return;
        const params = new URLSearchParams(searchParams.toString());
        params.set('range', 'custom');
        params.set('from', from);
        params.set('to', to);
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
            <div className="flex items-center gap-2 bg-white border rounded-md px-2 py-0.5 shadow-sm">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={range} onValueChange={handleRangeSelect}>
                    <SelectTrigger className="w-[140px] border-none shadow-none focus-visible:ring-0 px-1 py-1 h-8 bg-transparent text-sm font-medium">
                        <SelectValue placeholder="Date Range" />
                    </SelectTrigger>
                    <SelectContent align="end">
                        <SelectItem value="7d">Last 7 Days</SelectItem>
                        <SelectItem value="30d">Last 30 Days</SelectItem>
                        <SelectItem value="year">This Year</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {range === 'custom' && (
                <div className="flex items-center gap-2 bg-white p-1 rounded-md border shadow-sm animate-in fade-in zoom-in-95">
                    <Input
                        type="date"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        className="h-8 text-xs border-dashed"
                    />
                    <span className="text-muted-foreground text-xs font-semibold">-</span>
                    <Input
                        type="date"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        className="h-8 text-xs border-dashed"
                    />
                    <Button size="sm" className="h-8 px-2" onClick={applyCustomRange}>
                        Apply
                    </Button>
                </div>
            )}
        </div>
    );
}
