import { Settings } from "lucide-react";

export const metadata = {
    title: "System Settings | SaaS Control",
};

export default function SuperadminSystemPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                <Settings className="h-8 w-8 text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Platform Settings</h2>
            <p className="text-slate-500 text-sm max-w-sm text-center">System environment variables and global configurations.</p>
        </div>
    );
}
