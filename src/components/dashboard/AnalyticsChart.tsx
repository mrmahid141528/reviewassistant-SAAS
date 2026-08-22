"use client";

import {
    Area,
    AreaChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

type ChartDataProps = {
    data: { date: string; reviews: number }[];
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/90 backdrop-blur-md p-3 border border-gray-100 shadow-xl rounded-lg animate-in fade-in zoom-in-95 duration-200">
                <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-600" />
                    <p className="font-bold text-gray-900">
                        {payload[0].value} <span className="font-normal text-sm text-gray-500 ml-1">Reviews Generated</span>
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

export function AnalyticsChart({ data }: ChartDataProps) {
    return (
        <div className="h-[300px] w-full mt-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorReviews" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                        </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="date"
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        minTickGap={30}
                    />
                    <YAxis
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Area
                        type="monotone"
                        dataKey="reviews"
                        stroke="#2563eb"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorReviews)"
                        activeDot={{ r: 6, strokeWidth: 0, fill: '#1e40af' }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
