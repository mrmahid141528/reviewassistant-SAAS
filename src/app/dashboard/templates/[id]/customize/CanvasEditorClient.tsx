"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Printer, Download, Save, Camera, Smartphone } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { savePrintSettingsAction } from "@/app/dashboard/qr/actions";

interface CanvasEditorClientProps {
    template: any;
    business: any;
    campaigns: any[];
}

export function CanvasEditorClient({ template, business, campaigns }: CanvasEditorClientProps) {
    const [logoUrl, setLogoUrl] = useState(business.logoUrl || "");
    const [businessName, setBusinessName] = useState(business.name || "");
    const [isSaving, setIsSaving] = useState(false);

    // Pick the first campaign to generate a QR
    const activeCampaign = campaigns.length > 0 ? campaigns[0] : null;
    const publicReviewUrl = activeCampaign ? `${typeof window !== "undefined" ? window.location.origin : ""}/r/${business.slug}?campaign=${activeCampaign.id}` : "";

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setLogoUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        // We reuse the savePrintSettings action by persisting it to settings, 
        // though ideally we'd update the Business record directly. This is an MVP workaround for the settings JSON.
        const res = await savePrintSettingsAction({ logoUrl, businessName });
        if (res.success) {
            toast.success("Business Profile updated on Template!");
        } else {
            toast.error("Failed to update profile.");
        }
        setIsSaving(false);
    };

    const handlePrint = () => {
        const oldTitle = document.title;
        document.title = `${businessName} AI Google Review QR Poster`;
        window.print();
        setTimeout(() => { document.title = oldTitle; }, 1000);
    };

    return (
        <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans">
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { size: 4.69in 6.77in; margin: 0; }
                    body { visibility: hidden; background: white !important; }
                    #print-canvas, #print-canvas * { visibility: visible !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    #print-canvas { position: fixed; left: 0; top: 0; width: 100vw; height: 100vh; display: flex; justify-content: flex-start; align-items: flex-start; z-index: 99999; }
                    .no-print { display: none !important; }
                }
            `}} />

            {/* LEFTPANEL: Customizer Sidebar */}
            <div className="w-[380px] bg-white border-r border-slate-200 h-full flex flex-col z-10 shrink-0 no-print shadow-xl">
                <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                    <Link href="/dashboard/templates" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Link>
                    <div>
                        <h2 className="font-bold text-lg leading-tight">Studio Editor</h2>
                        <p className="text-xs font-semibold text-blue-600 truncate max-w-[200px]">{template.name}</p>
                    </div>
                </div>

                <div className="p-6 flex-1 overflow-y-auto space-y-8">
                    {/* Logo Section */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-800 mb-3">Business Logo</h3>
                        <div className="flex flex-col gap-3">
                            {logoUrl ? (
                                <div className="relative w-24 h-24 border-2 border-slate-200 rounded-xl overflow-hidden bg-white p-2 shrink-0 group">
                                    <img src={logoUrl} className="w-full h-full object-contain" />
                                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                        <Camera className="w-6 h-6 text-white" />
                                        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                    </label>
                                </div>
                            ) : (
                                <label className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer flex flex-col items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-400">
                                    <Camera className="w-6 h-6 mb-1" />
                                    <span className="text-[10px] font-bold">Add Logo</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                </label>
                            )}
                            <p className="text-[11px] text-slate-500 font-medium">This logo will overlay onto the template automatically.</p>
                        </div>
                    </div>

                    {/* Name Section */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-800 mb-2">Business Name</h3>
                        <Input
                            value={businessName}
                            onChange={e => setBusinessName(e.target.value)}
                            className="font-semibold bg-slate-50 border-slate-200 h-11"
                        />
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <Button onClick={handleSaveProfile} disabled={isSaving} className="w-full h-11 font-bold">
                            {isSaving ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save to Profile</>}
                        </Button>
                    </div>
                </div>
            </div>

            {/* CENTER: Canvas Workspace */}
            <div className="flex-1 flex flex-col relative h-full">
                {/* Topbar Actions */}
                <div className="h-20 w-full px-8 flex items-center justify-end gap-3 no-print z-10 shrink-0">
                    <Button variant="outline" className="h-10 bg-white font-bold shadow-sm rounded-lg border-slate-200" onClick={handlePrint}>
                        <Download className="w-4 h-4 mr-2 text-slate-500" /> Export PNG
                    </Button>
                    <Button onClick={handlePrint} className="h-10 bg-slate-900 hover:bg-black font-bold shadow-md rounded-lg">
                        <Printer className="w-4 h-4 mr-2" /> Print PDF
                    </Button>
                </div>

                {/* The Desk */}
                <div className="flex-1 flex items-start justify-center p-8 overflow-y-auto w-full no-print bg-[repeating-linear-gradient(45deg,#f8fafc,#f8fafc_20px,#f1f5f9_20px,#f1f5f9_40px)]">

                    {/* This bounds wrapper represents the physical print object */}
                    <div id="print-canvas" className="w-[450px] h-[650px] bg-white relative shadow-2xl border border-slate-200 shrink-0 overflow-hidden rounded-sm group">

                        {/* Background Template Graphic (z-0) */}
                        <div className="absolute inset-0 z-0 select-none pointer-events-none">
                            <img src={template.imageUrl} alt="Template Background" className="w-full h-full object-cover" />
                        </div>

                        {/* Dynamic Layer Overlay (z-10) */}
                        {/* 
                            This is an MVP exact-center overlay grid. 
                            In a highly advanced version, X/Y coordinates could be stored in DB per template.
                        */}
                        <div className="absolute inset-x-8 top-1/2 -translate-y-[40%] z-10 flex flex-col items-center justify-center p-6 bg-white/95 backdrop-blur-sm rounded-3xl border border-slate-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]">

                            {/* Logo */}
                            {logoUrl && (
                                <div className="w-20 h-20 bg-white shadow-sm border border-slate-100 p-1 mb-4 flex items-center justify-center -mt-12 rounded-2xl relative">
                                    <img src={logoUrl} className="max-w-full max-h-full object-contain" />
                                </div>
                            )}

                            {/* Title */}
                            <h2 className="text-xl font-black text-slate-900 text-center tracking-tight mb-5 leading-tight uppercase">
                                {businessName || "Your Business Name"}
                            </h2>

                            {/* QR Secure Box */}
                            <div className="bg-white p-3 border-2 border-slate-100 rounded-xl shadow-sm mb-4">
                                {activeCampaign ? (
                                    <QRCodeSVG value={publicReviewUrl} size={140} level="H" />
                                ) : (
                                    <div className="w-[140px] h-[140px] bg-slate-50 flex items-center justify-center text-slate-400 text-xs text-center p-4">
                                        No active campaign found
                                    </div>
                                )}
                            </div>

                            {/* CTA */}
                            <div className="flex items-center gap-2 text-slate-700 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                                <Smartphone className="w-4 h-4 text-blue-500" />
                                <p className="text-[11px] font-bold">Scan to leave a Google Review</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
