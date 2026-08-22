import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function SettingsLoading() {
    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-300">
            <div>
                <Skeleton className="h-8 w-48 bg-gray-200 mb-2" />
                <Skeleton className="h-4 w-72 bg-gray-100" />
            </div>

            <Card className="border-border/50 shadow-sm mt-6">
                <CardHeader>
                    <Skeleton className="h-6 w-56 bg-gray-200 mb-1" />
                    <Skeleton className="h-4 w-80 bg-gray-100" />
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32 bg-gray-200" />
                            <Skeleton className="h-10 w-full bg-gray-100 rounded-md" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-40 bg-gray-200" />
                            <Skeleton className="h-10 w-full bg-gray-100 rounded-md" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-48 bg-gray-200" />
                            <Skeleton className="h-10 w-full bg-gray-100 rounded-md" />
                        </div>
                    </div>
                    <div className="flex justify-end pt-4 border-t">
                        <Skeleton className="h-10 w-32 bg-blue-100 rounded-md" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
