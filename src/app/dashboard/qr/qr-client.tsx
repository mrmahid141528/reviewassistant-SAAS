"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Download, MessageCircle, Navigation, QrCode, Share2, Printer, Plus, CheckCircle2, MoreVertical, Link as LinkIcon, BarChart3, Clock, Loader2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState, useTransition } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { createCampaignAction } from "./actions";

export function QrClient({ publicReviewUrl, locations, campaigns, recentActivity = [] }: { publicReviewUrl: string, locations: { id: string, name: string }[], campaigns: any[], recentActivity?: any[] }) {

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [isCreatedSuccess, setIsCreatedSuccess] = useState(false);
    const [printTargetUrl, setPrintTargetUrl] = useState(publicReviewUrl);
    const [selectedPrintTemplate, setSelectedPrintTemplate] = useState("table-tent");

    const openPrintModal = (url: string) => {
        setPrintTargetUrl(url);
        setIsPrintModalOpen(true);
    };

    // Create Campaign Form State
    const [campaignName, setCampaignName] = useState("New Review Campaign");
    const [campaignLocation, setCampaignLocation] = useState("all");
    const [campaignType, setCampaignType] = useState("both");

    const [isPending, startTransition] = useTransition();

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
    }

    const downloadQR = (elementId: string, filename: string) => {
        const svg = document.getElementById(elementId);
        if (!svg) return;
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.onload = () => {
            const scale = 5;
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            if (ctx) {
                ctx.fillStyle = "white";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            }
            const pngFile = canvas.toDataURL("image/png", 1.0);
            const downloadLink = document.createElement("a");
            downloadLink.download = filename;
            downloadLink.href = pngFile;
            downloadLink.click();
        };
        img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    };

    const handleCreateCampaign = () => {
        startTransition(async () => {
            const res = await createCampaignAction({
                name: campaignName,
                locationId: campaignLocation,
                type: campaignType
            });
            if (res.success) {
                setIsCreatedSuccess(true);
            } else {
                alert("Error: " + res.error);
            }
        });
    }

    const triggerPrint = () => {
        window.print();
    }

    return (
        <div className="space-y-8 max-w-5xl animate-in fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">QR & Review Links</h2>
                    <p className="text-muted-foreground mt-1 text-lg">
                        Create, manage, and share your customer review campaigns.
                    </p>
                </div>
                <Button className="w-full md:w-auto" size="lg" onClick={() => { setIsCreatedSuccess(false); setIsCreateModalOpen(true); }}>
                    <Plus className="mr-2 w-4 h-4" /> Create Campaign
                </Button>
            </div>

            {/* Create Campaign Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
                    {!isCreatedSuccess ? (
                        <>
                            <DialogHeader>
                                <DialogTitle>Create Review Campaign</DialogTitle>
                                <DialogDescription>Set up a new endpoint to collect customer reviews.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Campaign Name</Label>
                                    <Input value={campaignName} onChange={(e) => setCampaignName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Location</Label>
                                    <select
                                        className="w-full bg-card border rounded-md text-sm px-3 py-2 outline-none focus:ring-1"
                                        value={campaignLocation}
                                        onChange={(e) => setCampaignLocation(e.target.value)}
                                    >
                                        <option value="all">Main Business / All Locations</option>
                                        {locations.map(loc => (
                                            <option key={loc.id} value={loc.id}>{loc.name} Branch</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2 pt-2">
                                    <Label>Campaign Type</Label>
                                    <div className="flex flex-col sm:grid sm:grid-cols-3 gap-2">
                                        {['QR Code', 'Digital Link', 'Both'].map((opt) => {
                                            const val = opt.toLowerCase().replace(' ', '-');
                                            return (
                                                <div
                                                    key={val}
                                                    onClick={() => setCampaignType(val)}
                                                    className={`border rounded-lg p-3 text-center text-sm cursor-pointer hover:border-primary transition-colors ${campaignType === val ? 'bg-primary/5 border-primary text-primary font-medium' : 'text-muted-foreground'}`}
                                                >
                                                    {opt}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                                <div className="border bg-emerald-50/50 border-emerald-100 rounded-lg p-3 mt-4">
                                    <div className="flex items-center text-emerald-800 font-medium text-sm">
                                        <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" /> Smart Review Flow
                                    </div>
                                    <div className="text-xs text-emerald-700 mt-1 pl-5">
                                        Answers will be processed by AI and converted to Google Review drafts.
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                                <Button onClick={handleCreateCampaign} disabled={isPending}>
                                    {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                    Create Campaign
                                </Button>
                            </DialogFooter>
                        </>
                    ) : (
                        <div className="py-6 flex flex-col items-center text-center space-y-4">
                            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-2">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold">Campaign created successfully!</h3>
                            <p className="text-muted-foreground text-sm max-w-sm">
                                <strong>{campaignName}</strong> is now live and ready to collect reviews.
                            </p>

                            <div className="bg-white border rounded-lg p-4 shadow-sm w-full my-4 flex flex-col items-center">
                                <QRCodeSVG value={publicReviewUrl} size={150} level="M" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-4">
                                <Button variant="outline" className="w-full justify-center" onClick={() => setIsCreateModalOpen(false)}><Download className="w-4 h-4 mr-2" /> Download QR</Button>
                                <Button variant="outline" className="w-full justify-center" onClick={() => { setIsCreateModalOpen(false); openPrintModal(publicReviewUrl); }}><Printer className="w-4 h-4 mr-2" /> Print QR</Button>
                                <Button variant="outline" className="w-full justify-center" onClick={() => copyToClipboard(publicReviewUrl)}><Copy className="w-4 h-4 mr-2" /> Copy Link</Button>
                                <Button className="w-full justify-center" onClick={() => window.open(publicReviewUrl, '_blank')}><Navigation className="w-4 h-4 mr-2" /> Test Flow</Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Main Content Tabs */}
            <Tabs defaultValue="campaigns" className="w-full">
                <TabsList className="flex overflow-x-auto w-full sm:inline-flex sm:w-auto p-1 touch-pan-x justify-start">
                    <TabsTrigger value="campaigns" className="flex-1 shrink-0 min-w-[110px] whitespace-nowrap">Campaigns</TabsTrigger>
                    <TabsTrigger value="qrcodes" className="flex-1 shrink-0 min-w-[110px] whitespace-nowrap">QR Codes</TabsTrigger>
                    <TabsTrigger value="links" className="flex-1 shrink-0 min-w-[110px] whitespace-nowrap">Review Links</TabsTrigger>
                </TabsList>

                {/* TAB: CAMPAIGNS (Main Tab) */}
                <TabsContent value="campaigns" className="mt-8 space-y-8">

                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Your Campaigns</h3>
                        {campaigns.length === 0 ? (
                            <div className="p-8 text-center border-2 border-dashed rounded-xl bg-card">
                                <p className="text-muted-foreground mb-4">You don't have any active campaigns yet.</p>
                                <Button onClick={() => setIsCreateModalOpen(true)}>+ Create First Campaign</Button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {campaigns.map((campaign, idx) => {
                                    const locObj = locations.find(l => l.id === campaign.locationId);
                                    const locName = locObj ? `${locObj.name} Branch` : 'All Locations';
                                    const campaignUrl = `${publicReviewUrl}?campaign=${campaign.id}`;
                                    const qrId = `campaign-qr-${campaign.id}`;

                                    return (
                                        <Card key={campaign.id} className={`${idx === 0 ? 'border-2 border-primary/20 bg-card overflow-hidden shadow-sm relative' : 'overflow-hidden relative'}`}>
                                            <div className="absolute top-4 right-4">
                                                <Button variant="ghost" size="icon" className="text-muted-foreground"><MoreVertical className="w-5 h-5" /></Button>
                                            </div>
                                            <CardContent className="p-6">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className={`w-2.5 h-2.5 rounded-full ${campaign.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                                                    <h3 className="text-xl font-bold">{campaign.name}</h3>
                                                </div>
                                                <p className="text-sm font-medium text-muted-foreground mb-6">
                                                    Location: {locName}
                                                </p>

                                                <div className="flex flex-col md:flex-row gap-8 bg-muted/30 p-6 rounded-xl border">
                                                    <div className="flex flex-col items-center bg-white p-4 rounded-xl border shadow-sm shrink-0">
                                                        <QRCodeSVG id={qrId} value={campaignUrl} size={150} level="M" />
                                                        <div className="mt-3 text-xs font-mono text-muted-foreground text-center">Scan to Review</div>
                                                    </div>
                                                    <div className="flex flex-col flex-1 pb-2">
                                                        <div className="mb-4">
                                                            <Label className="text-xs font-semibold text-muted-foreground uppercase flex items-center mb-1.5">
                                                                Customer Review Link
                                                            </Label>
                                                            <div className="flex items-center gap-2 bg-background border rounded-md px-3 py-2 w-full overflow-hidden">
                                                                <div className="font-mono text-sm text-muted-foreground truncate flex-1 min-w-0 leading-none pt-0.5">
                                                                    {campaignUrl}
                                                                </div>
                                                                <button onClick={() => copyToClipboard(campaignUrl)} className="text-muted-foreground hover:text-primary transition-colors cursor-pointer shrink-0 ml-2" title="Copy link">
                                                                    <Copy className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-1 gap-3 mt-auto">
                                                            <Button variant="default" className="w-full" onClick={() => window.open(campaignUrl, '_blank')}>
                                                                Test Flow <Navigation className="w-4 h-4 ml-2" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Stats */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8 mb-6 bg-background border rounded-xl p-4 sm:p-0 sm:border-none">
                                                    <div>
                                                        <div className="text-sm font-semibold text-muted-foreground mb-1">Feedback Sessions</div>
                                                        <div className="text-3xl font-bold tracking-tight">{campaign._count?.feedbackSubmissions || 0}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-muted-foreground mb-1">Conversion Rate</div>
                                                        <div className="text-3xl font-bold tracking-tight text-primary">0%</div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-6 border-t">
                                                    <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => downloadQR(qrId, `${campaign.slug}-qr.png`)}>
                                                        <Download className="w-4 h-4 mr-2" /> Download PNG
                                                    </Button>
                                                    <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => openPrintModal(campaignUrl)}>
                                                        <Printer className="w-4 h-4 mr-2" /> Print PDF
                                                    </Button>
                                                    <div className="hidden sm:block flex-1"></div>
                                                    <Button variant="ghost" size="sm" className="w-full sm:w-auto text-muted-foreground font-medium">
                                                        <BarChart3 className="w-4 h-4 mr-2" /> View Analytics
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Location QR Codes Table/List */}
                    {locations.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Location QR Codes (Direct)</h3>
                            </div>
                            <div className="border rounded-xl bg-card overflow-hidden">
                                <div className="grid grid-cols-12 gap-4 p-4 border-b bg-muted/50 text-xs font-semibold text-muted-foreground uppercase hidden md:grid">
                                    <div className="col-span-12 md:col-span-4">Location</div>
                                    <div className="col-span-12 md:col-span-3">Status</div>
                                    <div className="col-span-12 md:col-span-2 text-right">Scans</div>
                                    <div className="col-span-12 md:col-span-2 text-right">Reviews</div>
                                    <div className="col-span-12 md:col-span-1 text-center">QR</div>
                                </div>

                                {locations.map(loc => (
                                    <div key={loc.id} className="flex flex-col sm:grid sm:grid-cols-12 gap-4 p-4 items-start sm:items-center border-b hover:bg-muted/30 transition-colors relative">
                                        <div className="sm:col-span-4 font-semibold text-sm">{loc.name}</div>
                                        <div className="sm:col-span-3 flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 w-max px-2 py-1 rounded-full">
                                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5"></span> Active
                                        </div>

                                        <div className="flex w-full justify-between sm:contents mt-2 sm:mt-0">
                                            <div className="sm:hidden text-xs text-muted-foreground uppercase font-semibold">Sessions</div>
                                            <div className="sm:col-span-2 sm:text-right font-mono text-sm">--</div>
                                        </div>

                                        <div className="flex w-full justify-between sm:contents mt-1 sm:mt-0">
                                            <div className="sm:hidden text-xs text-muted-foreground uppercase font-semibold">Rate</div>
                                            <div className="sm:col-span-2 sm:text-right font-mono text-sm">--</div>
                                        </div>

                                        <div className="absolute top-4 right-4 sm:static sm:col-span-1 sm:text-center">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 bg-muted sm:bg-transparent" onClick={() => openPrintModal(`${publicReviewUrl}?location=${loc.id}`)}>
                                                <QrCode className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recent Activity */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Recent Activity</h3>
                        <div className="border rounded-xl bg-card p-5 space-y-4">
                            {recentActivity && recentActivity.length > 0 ? recentActivity.map((activity) => (
                                <div key={activity.id} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><QrCode className="w-4 h-4" /></div>
                                        <div><span className="font-semibold">Review received</span> at {activity.campaign?.name || "Main Campaign"}</div>
                                    </div>
                                    <div className="text-muted-foreground flex items-center text-xs w-28 text-right justify-end"><Clock className="w-3.5 h-3.5 mr-1" /> {new Date(activity.submittedAt).toLocaleDateString()}</div>
                                </div>
                            )) : (
                                <div className="text-center text-sm text-muted-foreground py-4">No recent activity detected.</div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                {/* TAB: QR CODES */}
                <TabsContent value="qrcodes" className="mt-8 space-y-6">
                    <div className="flex justify-end border-b pb-4 mb-6">
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(true)}><Plus className="w-4 h-4 mr-2" /> Create QR Code</Button>
                    </div>

                    {campaigns.map(c => {
                        const locObj = locations.find(l => l.id === c.locationId);
                        const cUrl = `${publicReviewUrl}?campaign=${c.id}`;
                        const qrId = `qr-tab-${c.id}`;
                        return (
                            <Card key={c.id}>
                                <CardContent className="p-6 flex flex-col md:flex-row items-center gap-8">
                                    <div className="bg-white p-6 border rounded-xl shadow-sm">
                                        <QRCodeSVG id={qrId} value={cUrl} size={150} level="M" />
                                    </div>
                                    <div className="flex-1 space-y-6 w-full">
                                        <div>
                                            <h3 className="text-xl font-bold">{c.name} QR</h3>
                                            <p className="text-muted-foreground text-sm font-medium mt-1">{locObj ? locObj.name : "All Locations"} • Active Campaign</p>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-sm">
                                            <Button className="w-full" onClick={() => downloadQR(qrId, `${c.slug}-qr.png`)}><Download className="w-4 h-4 mr-2" /> Download</Button>
                                            <Button className="w-full" variant="outline" onClick={() => openPrintModal(cUrl)}><Printer className="w-4 h-4 mr-2" /> Print PDF</Button>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="hidden md:flex"><MoreVertical className="w-5 h-5" /></Button>
                                </CardContent>
                            </Card>
                        )
                    })}
                </TabsContent>

                {/* TAB: REVIEW LINKS */}
                <TabsContent value="links" className="mt-8 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Smart Review Link</CardTitle>
                            <CardDescription>Customers first answer your questions and generate their review draft.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2 bg-background border rounded-md px-3 py-2 w-full overflow-hidden">
                                <div className="font-mono text-sm text-foreground truncate flex-1 min-w-0 leading-none pt-0.5">
                                    {publicReviewUrl}
                                </div>
                                <button onClick={() => copyToClipboard(publicReviewUrl)} className="text-muted-foreground hover:text-primary transition-colors cursor-pointer shrink-0 ml-2" title="Copy link">
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 mt-2">
                                <Button variant="secondary" className="w-full" onClick={() => window.open(publicReviewUrl, '_blank')}><Navigation className="w-4 h-4 mr-2" /> Open</Button>
                            </div>

                            <div className="pt-4 border-t mt-4">
                                <h4 className="text-sm font-semibold mb-3 flex items-center">Share Campaign <Share2 className="w-4 h-4 ml-2 text-muted-foreground" /></h4>
                                <div className="flex flex-wrap gap-2">
                                    <Button variant="outline" className="bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 border-[#25D366]/30" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Hi! Thanks for visiting. Please leave us a review here: ${publicReviewUrl}`)}`, '_blank')}>
                                        <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
                                    </Button>
                                    <Button variant="outline"><MessageCircle className="w-4 h-4 mr-2" /> SMS</Button>
                                    <Button variant="outline">Email</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Direct Google Review Link</CardTitle>
                            <CardDescription>Where customers publish their final review on Google. (Bypasses Smart UI)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 bg-background border rounded-md px-3 py-2 w-full mb-3 overflow-hidden">
                                <div className="font-mono text-sm text-muted-foreground truncate flex-1 min-w-0 leading-none pt-0.5">
                                    https://g.page/r/xxxxx/review
                                </div>
                                <button onClick={() => copyToClipboard(`https://g.page/r/xxxxx/review`)} className="text-muted-foreground hover:text-primary transition-colors cursor-pointer shrink-0 ml-2" title="Copy link">
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                            <Button className="w-full" variant="ghost" onClick={() => window.open(`https://g.page/r/xxxxx/review`, '_blank')}>Open</Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Print Styles injection for the print modal - only injected when modal is active */}
            {isPrintModalOpen && (
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        #print-section, #print-section * {
                            visibility: visible;
                        }
                        #print-section {
                            position: absolute;
                            left: 0;
                            top: 0;
                            margin: 0;
                            padding: 0;
                            border: none !important;
                            box-shadow: none !important;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        @page {
                            size: auto;
                            margin: 0mm;
                        }
                    }
                `}} />
            )}

            {/* Print Templates Design Modal Overlay */}
            <Dialog open={isPrintModalOpen} onOpenChange={setIsPrintModalOpen}>
                <DialogContent className="max-w-[95vw] sm:max-w-[80vw] md:max-w-4xl lg:max-w-5xl p-0 overflow-hidden bg-background">
                    <div className="flex flex-col md:flex-row h-[85vh] md:h-[650px] max-h-[90vh]">

                        {/* Left Side: Previews Selection */}
                        <div className="bg-muted p-6 flex flex-col w-full md:w-80 shrink-0 border-r overflow-y-auto">
                            <div>
                                <h2 className="text-xl font-bold tracking-tight mb-1">Print Ready</h2>
                                <p className="text-muted-foreground text-sm">Select a template to generate a high-resolution PDF for printing.</p>
                            </div>

                            <div className="space-y-4 mt-6">
                                <div
                                    onClick={() => setSelectedPrintTemplate('table-tent')}
                                    className={`bg-card border-2 rounded-xl p-4 flex flex-col gap-3 cursor-pointer transition-all ${selectedPrintTemplate === 'table-tent' ? 'border-primary shadow-sm' : 'border-transparent shadow-sm hover:border-primary/30'}`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="font-bold text-sm flex items-center">Table Tent</div>
                                        {selectedPrintTemplate === 'table-tent' && <CheckCircle2 className="w-4 h-4 text-primary" />}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Double-sided folded 4x6"</div>
                                </div>

                                <div
                                    onClick={() => setSelectedPrintTemplate('a4-poster')}
                                    className={`bg-card border-2 rounded-xl p-4 flex flex-col gap-3 cursor-pointer transition-all ${selectedPrintTemplate === 'a4-poster' ? 'border-primary shadow-sm' : 'border-transparent shadow-sm hover:border-primary/30'}`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="font-bold text-sm flex items-center">A4 Poster / Flyer</div>
                                        {selectedPrintTemplate === 'a4-poster' && <CheckCircle2 className="w-4 h-4 text-primary" />}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Standard 8.5x11" portrait</div>
                                </div>

                                <div
                                    onClick={() => setSelectedPrintTemplate('business-card')}
                                    className={`bg-card border-2 rounded-xl p-4 flex flex-col gap-3 cursor-pointer transition-all ${selectedPrintTemplate === 'business-card' ? 'border-primary shadow-sm' : 'border-transparent shadow-sm hover:border-primary/30'}`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="font-bold text-sm flex items-center">Business Card</div>
                                        {selectedPrintTemplate === 'business-card' && <CheckCircle2 className="w-4 h-4 text-primary" />}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Standard 3.5x2" landscape</div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: The Visual Preview rendering space */}
                        <div className="flex-1 bg-slate-50 flex flex-col relative w-full overflow-hidden">

                            {/* Inner scroll area for vertical & horizontal overflow */}
                            <div className="flex-1 overflow-auto p-4 flex flex-col items-start min-h-0 sm:items-center sm:justify-start relative bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">

                                <div id="print-section">
                                    {selectedPrintTemplate === 'table-tent' && (
                                        <div className="relative">
                                            <div className="w-64 bg-white border border-slate-200 shadow-xl rounded-md flex flex-col items-center p-8 text-center shrink-0">
                                                <div className="flex justify-center text-amber-400 text-2xl tracking-widest mb-3">★★★★★</div>
                                                <h3 className="font-black text-slate-900 text-xl leading-snug uppercase">Enjoyed your experience?</h3>

                                                <div className="mt-8 mb-8 p-3 bg-white rounded-lg border-2 border-slate-200 mx-auto w-fit">
                                                    <QRCodeSVG value={printTargetUrl} size={140} level="H" />
                                                </div>

                                                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest text-center">
                                                    Scan here to share<br />your feedback
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {selectedPrintTemplate === 'a4-poster' && (
                                        <div className="w-[400px] h-[550px] bg-white shadow-2xl border relative flex flex-col items-center justify-center p-12 shrink-0">
                                            <div className="absolute top-0 left-0 right-0 h-4 bg-primary"></div>
                                            <h1 className="text-5xl font-black text-slate-900 z-10 mb-2 mt-4 text-center leading-none">REVIEW US</h1>
                                            <h2 className="text-base font-bold text-primary z-10 mb-12 uppercase tracking-widest text-center">On Google</h2>

                                            <div className="p-4 bg-white shadow-sm border-4 border-slate-100 rounded-3xl z-10">
                                                <QRCodeSVG value={printTargetUrl} size={220} level="H" />
                                            </div>

                                            <p className="text-center text-base font-semibold text-slate-500 mt-12 max-w-[280px]">
                                                Open your camera and scan the code above to leave us a quick review.
                                            </p>
                                            <div className="flex gap-1.5 text-amber-400 text-3xl mt-8">★★★★★</div>
                                        </div>
                                    )}

                                    {selectedPrintTemplate === 'business-card' && (
                                        <div className="w-[420px] h-[240px] bg-white shadow-xl rounded-md border-2 border-slate-200 flex flex-row shrink-0 bg-gradient-to-br from-white to-slate-50">
                                            <div className="w-1/2 p-6 flex flex-col items-start justify-center border-r">
                                                <div className="flex text-amber-400 text-xl mb-3">★★★★★</div>
                                                <h2 className="font-black text-slate-900 text-2xl leading-tight mb-2 uppercase tracking-tight">Love our<br />service?</h2>
                                                <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">Scan to review</p>
                                            </div>
                                            <div className="w-1/2 flex items-center justify-center bg-white p-6">
                                                <div className="p-2 border-2 border-slate-100 rounded-xl shadow-sm">
                                                    <QRCodeSVG value={printTargetUrl} size={130} level="M" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Fixed bottom bar */}
                            <div className="bg-white border-t p-4 flex items-center justify-between shadow-sm shrink-0 w-full z-10">
                                <div className="flex flex-col text-xs text-muted-foreground justify-center">
                                    <span className="font-semibold text-foreground tracking-wide">FORMAT: {selectedPrintTemplate.toUpperCase()}</span>
                                    <span>Ready for high-quality printing</span>
                                </div>
                                <Button onClick={triggerPrint}><Printer className="w-4 h-4 mr-2" /> Print PDF</Button>
                            </div>

                        </div>

                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function SparklesIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-sparkles w-4 h-4"
        >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            <path d="M5 3v4" />
            <path d="M19 17v4" />
            <path d="M3 5h4" />
            <path d="M17 19h4" />
        </svg>
    );
}
