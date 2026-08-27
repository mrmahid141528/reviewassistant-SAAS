import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Download, Link as LinkIcon, Printer } from 'lucide-react';

interface QuickQRCardProps {
    businessName: string;
}

export function QuickQRCard({ businessName }: QuickQRCardProps) {
    return (
        <Card className="h-full shadow-sm overflow-hidden flex flex-col group relative">
            <div className="absolute right-4 top-4 hover:bg-muted p-1 rounded-md transition-colors cursor-pointer text-muted-foreground hover:text-foreground flex items-center text-xs font-medium">
                View QR &rarr;
            </div>

            <CardContent className="pt-8 pb-6 px-6 flex flex-col items-center text-center flex-1">
                <div className="mb-2">
                    <h3 className="font-bold text-lg text-foreground mb-1">Your Review QR Code</h3>
                </div>

                <div className="my-6 relative bg-white p-4 rounded-xl border shadow-sm">
                    {/* Simulated QR Code Visual Layer */}
                    <QrCode className="w-32 h-32 text-zinc-900" strokeWidth={1.5} />
                    <div className="absolute inset-0 border-2 border-dashed border-zinc-200 pointer-events-none rounded-xl" style={{ margin: '-4px' }} />
                </div>

                <p className="text-sm font-semibold truncate w-full max-w-[200px] text-foreground mb-6">
                    {businessName}
                </p>

                <div className="grid grid-cols-2 gap-3 w-full mt-auto">
                    <Button variant="outline" size="sm" className="w-full text-xs h-9">
                        <Download className="mr-2 w-3.5 h-3.5" /> Download
                    </Button>
                    <Button variant="outline" size="sm" className="w-full text-xs h-9">
                        <Printer className="mr-2 w-3.5 h-3.5" /> Print
                    </Button>
                    <Button variant="secondary" size="sm" className="col-span-2 w-full text-xs h-9">
                        <LinkIcon className="mr-2 w-3.5 h-3.5" /> Copy Link
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
