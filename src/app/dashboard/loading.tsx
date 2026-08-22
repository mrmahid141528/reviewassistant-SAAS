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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="border-border/50 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <Skeleton className="h-5 w-32 bg-gray-200" />
                            <Skeleton className="h-6 w-6 rounded-full bg-gray-200" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16 bg-gray-300 mt-1" />
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
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
