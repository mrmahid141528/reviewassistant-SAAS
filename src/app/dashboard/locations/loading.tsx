import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function LocationsLoading() {
    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-300">
            <div className="flex justify-between items-start">
                <div>
                    <Skeleton className="h-8 w-48 bg-gray-200 mb-2" />
                    <Skeleton className="h-4 w-72 bg-gray-100" />
                </div>
                <Skeleton className="h-10 w-32 bg-blue-100 rounded-md" />
            </div>

            <Card className="border-border/50 shadow-sm mt-6">
                <CardHeader>
                    <Skeleton className="h-6 w-32 bg-gray-200 mb-1" />
                    <Skeleton className="h-4 w-64 bg-gray-100" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 pt-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex justify-between items-center p-4 border rounded-lg bg-gray-50/50">
                                <div className="space-y-2 w-full">
                                    <Skeleton className="h-5 w-48 bg-gray-200" />
                                    <div className="flex gap-2">
                                        <Skeleton className="h-4 w-64 bg-gray-100" />
                                    </div>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <Skeleton className="h-8 w-8 bg-gray-200 rounded-md" />
                                    <Skeleton className="h-8 w-8 bg-red-100 rounded-md" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
