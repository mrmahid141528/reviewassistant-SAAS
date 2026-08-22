import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function QrLoading() {
    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-8 flex items-center justify-center animate-in fade-in duration-300">
            <Card className="w-full max-w-md border-border/50 shadow-sm mt-12">
                <CardHeader className="text-center">
                    <Skeleton className="h-6 w-48 bg-gray-200 mx-auto mb-2" />
                    <Skeleton className="h-4 w-64 bg-gray-100 mx-auto" />
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center space-y-6 py-8">
                    <div className="p-4 bg-gray-50 border rounded-xl">
                        <Skeleton className="h-48 w-48 bg-gray-200 rounded-lg" />
                    </div>
                    <div className="space-y-4 w-full flex flex-col items-center">
                        <Skeleton className="h-10 w-full max-w-[250px] bg-blue-100 rounded-md" />
                        <Skeleton className="h-10 w-full max-w-[250px] bg-gray-100 rounded-md" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
