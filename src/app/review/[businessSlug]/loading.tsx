import { Loader2 } from "lucide-react";

export default function ReviewPageLoading() {
    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[500px] w-full bg-white p-8 animate-in fade-in duration-500">
            <Loader2 className="h-12 w-12 animate-spin text-primary opacity-80 mb-6" />
            <h2 className="text-lg font-medium text-gray-900">Loading experience...</h2>
            <p className="text-sm text-gray-500 mt-2">Connecting you to the business</p>
        </div>
    );
}
