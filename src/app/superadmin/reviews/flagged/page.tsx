import { ShieldAlert, AlertTriangle, AlertCircle } from "lucide-react";

export const metadata = {
    title: "Flagged Activity | SaaS Control",
};

export default function SuperadminFlaggedPage() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-rose-700">Flagged Activity & Security</h2>
                    <p className="text-sm text-slate-500">Monitor API abuse, automated bot traffic, and rate-limit violations across AI generation endpoints.</p>
                </div>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 shadow-sm flex items-start gap-4 mb-6">
                <div className="mt-1">
                    <ShieldAlert className="h-6 w-6 text-rose-600" />
                </div>
                <div>
                    <h3 className="text-base font-bold text-rose-900">Real-time Abuse Protection Active</h3>
                    <p className="text-sm text-rose-700 mt-1">
                        The platform automatically monitors IP repetition and rate-limits rapid sequential requests to the Gemini AI models to prevent cost-overruns.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-2">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Severity</th>
                                <th className="px-6 py-4 font-semibold">Detection Type</th>
                                <th className="px-6 py-4 font-semibold">Tenant Source</th>
                                <th className="px-6 py-4 font-semibold">Log Information</th>
                                <th className="text-right px-6 py-4 font-semibold">Time</th>
                                <th className="text-right px-6 py-4 font-semibold">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                    <div className="flex flex-col items-center justify-center">
                                        <ShieldAlert className="h-8 w-8 text-slate-300 mb-3" />
                                        <p className="font-medium text-slate-600">No anomalous activity detected.</p>
                                        <p className="text-xs mt-1">Platform operations are running optimally.</p>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
