import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardLoading() {
    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
            {/* Header Skeleton */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-64 bg-gray-200" />
                <Skeleton className="h-4 w-96 bg-gray-100" />
            </div>

            {/* Metrics Grid Skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="border-border/50 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <Skeleton className="h-5 w-32 bg-gray-200" />
                            <Skeleton className="h-6 w-6 rounded-full bg-gray-200" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16 bg-gray-300 mt-1" />
                            <Skeleton className="h-3 w-28 bg-gray-200 mt-2" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Chart Skeleton */}
            <Card className="col-span-4 border-border/50 shadow-sm">
                <CardHeader>
                    <Skeleton className="h-6 w-48 bg-gray-200 mb-1" />
                    <Skeleton className="h-4 w-72 bg-gray-100" />
                </CardHeader>
                <CardContent>
                    <div className="h-[400px] w-full flex items-end justify-between space-x-2 pt-6">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="w-full flex flex-col justify-end space-y-2 h-full">
                                <Skeleton
                                    className="w-full bg-gray-100/50 rounded-t-sm"
                                    style={{ height: `${Math.random() * 80 + 10}%` }}
                                />
                            </div>
                        ))}
                        {/* Bottom Activity Grid Skeleton */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                            <Card className="col-span-4 border-border/50 shadow-sm">
                                <CardHeader>
                                    <Skeleton className="h-6 w-48 bg-gray-200 mb-1" />
                                    <Skeleton className="h-4 w-72 bg-gray-100" />
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex border-b pb-4 border-gray-100 gap-4">
                                            <Skeleton className="h-8 w-8 rounded-full bg-gray-200 shrink-0" />
                                            <div className="space-y-2 w-full">
                                                <Skeleton className="h-4 w-1/3 bg-gray-200" />
                                                <Skeleton className="h-3 w-4/5 bg-gray-100" />
                                                <Skeleton className="h-3 w-3/5 bg-gray-100" />
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            <Card className="col-span-3 border-border/50 shadow-sm">
                                <CardHeader>
                                    <Skeleton className="h-6 w-40 bg-gray-200 mb-1" />
                                    <Skeleton className="h-4 w-64 bg-gray-100" />
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {[1, 2].map((i) => (
                                        <div key={i} className="flex border-b pb-4 border-gray-100 gap-4">
                                            <Skeleton className="h-8 w-8 rounded-full bg-red-100 shrink-0" />
                                            <div className="space-y-2 w-full">
                                                <Skeleton className="h-4 w-2/3 bg-gray-200" />
                                                <Skeleton className="h-3 w-1/2 bg-gray-100" />
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                </CardContent>
            </Card>
        </div>
    );
}
