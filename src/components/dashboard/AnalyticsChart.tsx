"use client";

import {
    AreaChart,
    Area,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    CartesianGrid
} from "recharts";

type ChartDataProps = {
    data: { date: string; reviews: number; scans?: number }[];
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 backdrop-blur-md p-3 border border-slate-200 shadow-xl rounded-lg animate-in fade-in relative z-50">
                <p className="text-xs text-slate-500 font-semibold mb-2 uppercase">{label}</p>
                <div className="flex flex-col gap-1.5">
                    {payload.find((p: any) => p.dataKey === 'scans') && (
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-1.5">
                                <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                                <span className="font-medium text-sm text-slate-600">QR Scans</span>
                            </div>
                            <span className="font-bold text-slate-900">{payload.find((p: any) => p.dataKey === 'scans').value}</span>
                        </div>
                    )}
                    {payload.find((p: any) => p.dataKey === 'reviews') && (
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-1.5">
                                <div className="h-2.5 w-2.5 rounded-sm bg-blue-500" />
                                <span className="font-medium text-sm text-slate-600">Generated</span>
                            </div>
                            <span className="font-bold text-slate-900">{payload.find((p: any) => p.dataKey === 'reviews').value}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    }
    return null;
};

export function AnalyticsChart({ data }: ChartDataProps) {
    return (
        <div className="w-full mt-2 animate-in fade-in slide-in-from-bottom-2 duration-700 space-y-4">

            {/* Custom Top-Corner Legend */}
            <div className="flex items-center justify-end gap-5 text-[13px] font-medium mr-4">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-[3px] bg-emerald-500 rounded-full" />
                    <span className="text-slate-600">QR Scan</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-[3px] bg-blue-500 rounded-full" />
                    <span className="text-slate-600">Review generated</span>
                </div>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                            </linearGradient>
                            <linearGradient id="colorReviews" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis
                            dataKey="date"
                            stroke="#94a3b8"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={20}
                            dy={8}
                        />
                        <YAxis
                            stroke="#94a3b8"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                            dx={-8}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4', fill: 'transparent' }} />

                        <Area
                            type="monotone"
                            dataKey="scans"
                            name="QR Scans"
                            stroke="#10b981"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorScans)"
                            activeDot={{ r: 5, strokeWidth: 0, fill: '#047857' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="reviews"
                            name="Reviews Generated"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorReviews)"
                            activeDot={{ r: 5, strokeWidth: 0, fill: '#1d4ed8' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
