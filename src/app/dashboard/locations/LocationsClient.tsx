"use client"

import { useState } from "react"
import { addBusinessLocation, deleteBusinessLocation, setMainLocation, toggleLocationStatus } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, ExternalLink, MoreVertical, Edit, QrCode, TrendingUp, KeyRound, CheckCircle2, Building2, MapPin, SearchCheck, ChevronRight, Check } from "lucide-react"

type LocationClientProps = {
    locations: any[];
    maxLocations: number;
    currentCount: number;
    businessSlug: string;
}

export default function LocationsClient({ locations, maxLocations, currentCount, businessSlug }: LocationClientProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [step, setStep] = useState(1);

    // Form Data State
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
        reviewLink: ''
    });

    const isMaxedOut = currentCount >= maxLocations;
    const percentUsed = maxLocations === 0 ? 100 : Math.min(100, Math.round((currentCount / maxLocations) * 100));
    const remaining = Math.max(0, maxLocations - currentCount);

    const onNextStep = () => {
        setError("");
        setStep(step + 1);
    }
    const onPrevStep = () => setStep(step - 1);

    const onSubmit = async () => {
        setError("");
        setLoading(true);
        try {
            const fd = new FormData();
            Object.entries(formData).forEach(([key, value]) => fd.append(key, value));

            await addBusinessLocation(fd);

            // Go to final success step
            setStep(4);
        } catch (err: any) {
            setError(err.message || "Failed to add location");
        } finally {
            setLoading(false);
        }
    }

    const onDelete = async (id: string, isMain: boolean) => {
        if (isMain) {
            alert("Cannot delete the Main Location directly. Please set another location as Main first.");
            return;
        }
        if (!confirm("Are you sure you want to permanently delete this location?")) return;
        try {
            await deleteBusinessLocation(id);
        } catch (err: any) {
            alert(err.message);
        }
    }

    const onSetMain = async (id: string) => {
        if (!confirm("Set this location as your Main Location?")) return;
        try {
            await setMainLocation(id);
        } catch (err: any) {
            alert(err.message);
        }
    }

    const onToggleStatus = async (id: string, status: string, isMain: boolean) => {
        if (isMain && status === 'active') {
            alert("Cannot deactivate the Main Location.");
            return;
        }
        try {
            await toggleLocationStatus(id, status);
        } catch (err: any) {
            alert(err.message);
        }
    }

    const resetWizard = () => {
        setOpen(false);
        setStep(1);
        setFormData({ name: '', phone: '', address: '', city: '', state: '', postalCode: '', country: 'India', reviewLink: '' });
    }

    return (
        <div className="space-y-10 max-w-5xl mx-auto animate-in fade-in duration-500 pb-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Business Locations</h1>
                    <p className="text-muted-foreground mt-2 text-base max-w-xl">
                        Manage your physical store branches, customize Review Links, and track isolated location metrics.
                    </p>
                </div>

                <Button disabled={isMaxedOut} size="lg" className="gap-2 shrink-0 rounded-full px-6 shadow-sm font-semibold" onClick={() => !isMaxedOut && setOpen(true)}>
                    <Plus className="h-5 w-5" /> Add Location
                </Button>
            </div>

            {/* USAGE PANEL */}
            <div className="bg-card border border-border p-6 sm:p-8 rounded-[1.5rem] flex flex-col sm:flex-row gap-6 justify-between items-center shadow-[0_2px_20px_rgba(0,0,0,0.02)]">
                <div className="w-full max-w-2xl">
                    <div className="flex justify-between items-end mb-4">
                        <span className="font-semibold text-lg text-foreground">Location Usage</span>
                        <span className="text-base font-bold text-foreground">{currentCount} / {maxLocations} Active</span>
                    </div>
                    <Progress value={percentUsed} className="h-3 rounded-full bg-muted/60" />
                    <div className="mt-4 flex justify-between items-center text-sm">
                        {remaining > 0 ? (
                            <span className="text-muted-foreground text-sm font-medium">You can add <span className="font-bold text-foreground">{remaining}</span> more location{remaining !== 1 ? 's' : ''}.</span>
                        ) : (
                            <span className="text-destructive font-medium bg-destructive/10 px-3 py-1 rounded-md text-sm">You've reached your location limit.</span>
                        )}
                    </div>
                </div>
                {remaining === 0 && (
                    <div className="shrink-0 w-full sm:w-auto">
                        <Button variant="default" size="lg" className="w-full font-bold shadow-md">Upgrade Plan</Button>
                    </div>
                )}
            </div>


            {/* LOCATIONS LIST */}
            <div>
                <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase mb-4 ml-1">YOUR LOCATIONS</h3>

                <div className="space-y-4">
                    {locations.length > 0 ? (
                        locations.map((loc) => (
                            <div key={loc.id} className={`bg-card p-6 sm:p-8 rounded-[1.5rem] border ${loc.isMain ? 'border-primary shadow-[0_4px_30px_rgba(var(--primary-rgb),0.1)]' : 'border-border shadow-sm'} flex flex-col lg:flex-row gap-6 justify-between items-start transition-all hover:border-border/80`}>
                                {/* Basic Info */}
                                <div className="flex-1 max-w-md">
                                    <div className="flex items-center gap-3 mb-2">
                                        {loc.isMain && (
                                            <Badge variant="default" className="bg-primary/10 text-primary hover:bg-primary/20 border-0 px-2.5 py-0.5 pointer-events-none uppercase tracking-wide text-[10px] font-black w-fit">
                                                ⭐ Main Location
                                            </Badge>
                                        )}
                                        {loc.status === 'active' ? (
                                            <Badge variant="outline" className="text-green-600 bg-green-500/10 border-green-500/20 px-2.5 py-0.5 font-bold uppercase text-[10px]">● Active</Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-muted-foreground bg-muted border-border font-bold px-2.5 py-0.5 uppercase text-[10px]">○ Inactive</Badge>
                                        )}
                                    </div>

                                    <h3 className="font-bold text-foreground text-xl mt-3">{loc.name}</h3>
                                    <p className="text-sm font-medium text-foreground mt-1 opacity-80">{businessSlug}</p>

                                    {(loc.address || loc.city || loc.state) && (
                                        <p className="text-sm text-muted-foreground mt-3 flex items-start gap-1.5">
                                            <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-primary/70" />
                                            <span>
                                                {loc.address && <>{loc.address}<br /></>}
                                                {[loc.city, loc.state].filter(Boolean).join(", ")} {loc.postalCode}
                                            </span>
                                        </p>
                                    )}
                                </div>

                                {/* Metrics Mock (As requested by user architectural blueprint) */}
                                <div className="flex-1 w-full flex items-center lg:justify-center gap-6 lg:gap-12 mt-4 lg:mt-0 lg:border-l border-border/60 lg:pl-10 h-full py-2">
                                    <div className="text-center">
                                        <p className="text-xs text-muted-foreground font-semibold mb-1 uppercase tracking-wider">Rating</p>
                                        <p className="font-bold text-xl">⭐ 4.8</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-muted-foreground font-semibold mb-1 uppercase tracking-wider">Scans</p>
                                        <p className="font-bold text-xl">248</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-muted-foreground font-semibold mb-1 uppercase tracking-wider">Reviews</p>
                                        <p className="font-bold text-xl">142</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-3 mt-4 lg:mt-0 lg:self-center shrink-0 w-full lg:w-auto h-full">
                                    <Button variant="outline" className="flex-1 lg:flex-none font-semibold rounded-lg shadow-sm" onClick={() => window.location.href = `/dashboard/analytics?locationId=${loc.id}`}>
                                        <TrendingUp className="h-4 w-4 mr-2" /> Analytics
                                    </Button>
                                    <Button variant="default" className="flex-1 lg:flex-none font-semibold rounded-lg shadow-md">
                                        Manage
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger className="h-10 w-10 shrink-0 text-muted-foreground rounded-lg hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center outline-none">
                                            <MoreVertical className="h-5 w-5" />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)]">
                                            <DropdownMenuItem className="py-2.5 font-medium flex gap-2 cursor-pointer">
                                                <Edit className="h-4 w-4 opacity-70" /> Edit Details
                                            </DropdownMenuItem>
                                            {!loc.isMain && (
                                                <DropdownMenuItem className="py-2.5 font-medium flex gap-2 cursor-pointer" onClick={() => onSetMain(loc.id)}>
                                                    <KeyRound className="h-4 w-4 opacity-70" /> Set as Main Location
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuItem className="py-2.5 font-medium flex gap-2 cursor-pointer">
                                                <QrCode className="h-4 w-4 opacity-70" /> Download QR
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            {(!loc.isMain) && (
                                                <DropdownMenuItem className="py-2.5 font-medium flex gap-2 cursor-pointer text-orange-600 focus:text-orange-600 focus:bg-orange-50 dark:focus:bg-orange-950/30" onClick={() => onToggleStatus(loc.id, loc.status, loc.isMain)}>
                                                    <CheckCircle2 className="h-4 w-4 opacity-70" />
                                                    {loc.status === 'active' ? 'Deactivate' : 'Activate'}
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuItem className="py-2.5 font-medium flex gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => onDelete(loc.id, loc.isMain)}>
                                                <Trash2 className="h-4 w-4 opacity-70" /> Delete Location
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-card border border-border shadow-sm rounded-3xl">
                            <Building2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-foreground">No Locations Found</h3>
                            <p className="text-muted-foreground mt-2 max-w-sm mx-auto">You don't have any branches registered yet. Add your first location to get started.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ADD LOCATION WIZARD */}
            <Dialog open={open} onOpenChange={(val) => !val ? resetWizard() : setOpen(true)}>
                <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-0 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] rounded-[2rem]">
                    <div className="bg-muted/30 p-6 border-b border-border text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-muted">
                            <div className="h-full bg-primary transition-all duration-500" style={{ width: `${(step / 4) * 100}%` }} />
                        </div>
                        <h2 className="text-2xl font-black mt-2 text-foreground">
                            {step === 4 ? "Location Ready!" : "Add New Branch"}
                        </h2>
                        <p className="text-sm font-medium text-muted-foreground mt-1">
                            {step === 1 && "Step 1: Location details"}
                            {step === 2 && "Step 2: Physical address"}
                            {step === 3 && "Step 3: Connect Google Reviews"}
                            {step === 4 && "Successfully linked and generated QR"}
                        </p>
                    </div>

                    <div className="p-8">
                        {error && (
                            <div className="bg-destructive/10 text-destructive text-sm font-bold p-4 mb-6 rounded-xl border border-destructive/20 flex gap-2 items-start">
                                <Trash2 className="h-5 w-5 shrink-0" /> {error}
                            </div>
                        )}

                        {step === 1 && (
                            <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Location Name *</Label>
                                    <Input className="h-12 border-border/80 bg-background focus:ring-primary shadow-sm text-lg font-medium" placeholder="E.g. Market Branch" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Contact Phone</Label>
                                    <Input className="h-12 border-border/80 bg-background shadow-sm font-medium" placeholder="+91 98765 43210" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                                <div className="pt-6">
                                    <Button size="lg" className="w-full font-bold h-12 shadow-md hover:scale-[1.02] transition-transform" disabled={!formData.name} onClick={onNextStep}>
                                        Continue <ChevronRight className="h-5 w-5 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold">Street Address</Label>
                                    <Input className="h-10" placeholder="123 Example St" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold">City</Label>
                                        <Input className="h-10" placeholder="Raiganj" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold">State</Label>
                                        <Input className="h-10" placeholder="West Bengal" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold">Postal Code</Label>
                                        <Input className="h-10" placeholder="733134" value={formData.postalCode} onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold">Country</Label>
                                        <Input className="h-10 bg-muted/50 font-semibold" value="India" readOnly />
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-6">
                                    <Button variant="outline" size="lg" className="w-1/3 font-bold h-12" onClick={onPrevStep}>Back</Button>
                                    <Button size="lg" className="w-2/3 font-bold h-12 shadow-md hover:scale-[1.02] transition-transform" onClick={onNextStep}>
                                        Continue <ChevronRight className="h-5 w-5 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                <div className="space-y-3">
                                    <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Google Review Link *</Label>
                                    <p className="text-sm text-foreground/80 font-medium">Link specific to {formData.name}</p>
                                    <Input className="h-12 border-border bg-background shadow-sm font-medium" placeholder="https://g.page/r/abcdefghij/review" value={formData.reviewLink} onChange={(e) => setFormData({ ...formData, reviewLink: e.target.value })} />
                                </div>

                                {formData.reviewLink.includes('g.page') ? (
                                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex gap-3 text-green-700 dark:text-green-400">
                                        <SearchCheck className="h-6 w-6 mt-0.5" />
                                        <div>
                                            <p className="font-bold text-sm">Valid Google Business Link</p>
                                            <p className="text-xs font-medium opacity-80 mt-1">This link will route customers appropriately.</p>
                                        </div>
                                    </div>
                                ) : formData.reviewLink.length > 5 ? (
                                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 text-amber-700 dark:text-amber-400">
                                        <SearchCheck className="h-6 w-6 mt-0.5" />
                                        <div>
                                            <p className="font-bold text-sm">Verifying format...</p>
                                            <p className="text-xs font-medium opacity-80 mt-1">Make sure you paste the exact link from Google Profile.</p>
                                        </div>
                                    </div>
                                ) : null}

                                <div className="flex gap-3 pt-6">
                                    <Button variant="outline" size="lg" className="w-1/3 font-bold h-12" onClick={onPrevStep}>Back</Button>
                                    <Button size="lg" className="w-2/3 font-bold h-12 shadow-md hover:scale-[1.02] transition-transform" disabled={loading} onClick={onSubmit}>
                                        {loading ? "Creating..." : "Create Location"}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="text-center space-y-6 animate-in slide-in-from-bottom-6 duration-700 zoom-in-95">
                                <div className="h-24 w-24 bg-green-500/10 rounded-full mx-auto flex items-center justify-center">
                                    <Check className="h-10 w-10 text-green-500 stroke-[3px]" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-foreground">Location Created!</h3>
                                    <p className="text-muted-foreground mt-2 font-medium">Your location QR and dedicated review link are now ready to be customized.</p>
                                </div>
                                <div className="pt-4 flex flex-col gap-3">
                                    <Button size="lg" className="w-full font-bold h-12 rounded-xl shadow-md" onClick={() => resetWizard()}>View Locations</Button>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
