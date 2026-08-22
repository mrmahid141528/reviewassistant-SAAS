import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function BillingLoading() {
    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-300">
            <div>
                <Skeleton className="h-8 w-64 bg-gray-200 mb-2" />
                <Skeleton className="h-4 w-96 bg-gray-100" />
            </div>

            <div className="grid gap-6 lg:grid-cols-3 mt-8">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="relative flex flex-col justify-between border-border/50 shadow-sm overflow-hidden">
                        <CardHeader className="text-center pb-2">
                            <Skeleton className="h-6 w-32 bg-gray-200 mx-auto mb-2" />
                            <Skeleton className="h-4 w-48 bg-gray-100 mx-auto" />
                            <div className="mt-4 flex justify-center">
                                <Skeleton className="h-10 w-24 bg-gray-200" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ul className="mt-4 space-y-3 mb-6">
                                {[1, 2, 3, 4].map((j) => (
                                    <li key={j} className="flex items-center gap-3">
                                        <Skeleton className="h-4 w-4 rounded-full bg-gray-200 shrink-0" />
                                        <Skeleton className="h-4 w-full bg-gray-100" />
                                    </li>
                                ))}
                            </ul>
                            <Skeleton className="h-10 w-full rounded-lg bg-gray-200" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
