"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Download, Link as LinkIcon, RefreshCw } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export function QrClient({ publicReviewUrl }: { publicReviewUrl: string }) {
    const copyLink = () => {
        navigator.clipboard.writeText(publicReviewUrl);
        alert("Link copied to clipboard!");
    }

    const handleDownloadHighQualityPng = () => {
        const svg = document.getElementById("qr-code-svg");
        if (!svg) return;
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.onload = () => {
            const scale = 5; // 5x scale for print quality (e.g. 1100x1100 px from 220x220)
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            if (ctx) {
                ctx.fillStyle = "white";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            }
            const pngFile = canvas.toDataURL("image/png", 1.0);
            const downloadLink = document.createElement("a");
            downloadLink.download = "review-assistant-qr-hq.png";
            downloadLink.href = pngFile;
            downloadLink.click();
        };
        img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">QR Code</h2>
                <p className="text-muted-foreground">
                    Generate, download, and share your review assistant QR code.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Your Review Code</CardTitle>
                        <CardDescription>
                            Customers can scan this code with their smartphone camera to access your review assistant.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center py-6">
                        <div className="rounded-xl border bg-white p-6 shadow-sm">
                            <QRCodeSVG
                                id="qr-code-svg"
                                value={publicReviewUrl}
                                size={220}
                                level="Q"
                                includeMargin={true}
                            />
                        </div>

                        <p className="text-sm text-muted-foreground text-center mt-6">
                            Place this at your checkout counter, tables, or on receipts.
                        </p>
                    </CardContent>
                    <CardFooter className="flex items-center justify-center gap-2 border-t px-6 py-4">
                        <Button className="w-full gap-2" onClick={handleDownloadHighQualityPng}>
                            <Download className="h-4 w-4" /> Download High-Quality PNG
                        </Button>
                    </CardFooter>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Shareable Link</CardTitle>
                            <CardDescription>
                                You can also send this link directly to customers via WhatsApp, SMS, or Email.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="publicUrl">Public Review URL</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="publicUrl"
                                        value={publicReviewUrl}
                                        readOnly
                                        className="bg-muted"
                                    />
                                    <Button variant="secondary" size="icon" className="shrink-0" title="Copy to clipboard" onClick={copyLink}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" className="shrink-0" title="Open in new tab" onClick={() => window.open(publicReviewUrl, '_blank')}>
                                        <LinkIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Advanced Options</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                If your QR code is ever compromised or you need to cycle out an old link, you can regenerate your unique business ID.
                            </p>
                            <Button variant="destructive" className="w-full gap-2">
                                <RefreshCw className="h-4 w-4" /> Regenerate URL & QR Code
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
