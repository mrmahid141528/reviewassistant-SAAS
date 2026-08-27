import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Play, QrCode } from 'lucide-react';

interface SetupBannerProps {
    businessName: string;
    isSetupComplete: boolean;
}

export function SetupBanner({ businessName, isSetupComplete }: SetupBannerProps) {
    if (!isSetupComplete) {
        return (
            <div className="w-full rounded-xl border border-amber-200 bg-amber-50 p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm animate-in fade-in">
                <div>
                    <h3 className="text-amber-800 font-semibold text-lg flex items-center gap-2">
                        ⚠️ Complete your setup
                    </h3>
                    <p className="text-amber-700/80 text-sm mt-1">
                        Connect your Google Review link to start collecting reviews.
                    </p>
                </div>
                <Button className="bg-amber-600 hover:bg-amber-700 text-white shrink-0">
                    Connect Google
                </Button>
            </div>
        )
    }

    return (
        <div className="w-full rounded-xl border border-emerald-200/50 bg-emerald-50/50 p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm animate-in fade-in transition-all">
            <div>
                <h3 className="text-emerald-800 font-semibold text-lg flex items-center gap-2">
                    🎉 Your review system is ready
                </h3>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-medium text-emerald-900">{businessName}</span>
                    <span className="text-emerald-300">•</span>
                    <span className="text-sm text-emerald-700">Google Link connected</span>
                    <span className="text-emerald-300">•</span>
                    <span className="text-sm text-emerald-700">QR Code active</span>
                </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
                <Button variant="outline" size="sm" className="bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 flex-1 md:flex-none">
                    <QrCode className="w-4 h-4 mr-2" /> View QR Code
                </Button>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex-1 md:flex-none">
                    <Play className="w-3 h-3 mr-2 fill-current" /> Test Customer Flow
                </Button>
            </div>
        </div>
    );
}
