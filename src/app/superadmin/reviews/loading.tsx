import { Loader2 } from "lucide-react";

export default function ReviewsLoading() {
    return (
        <div className="w-full flex flex-col items-center justify-center min-h-[50vh] gap-4">
            <Loader2 className="h-8 w-8 text-slate-400 animate-spin" />
            <p className="text-sm font-medium text-slate-500 animate-pulse">Aggregating platform metrics...</p>
        </div>
    );
}
