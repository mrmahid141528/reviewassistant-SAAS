"use client";

import { useState } from "react";
import { ActionForm } from "@/components/ui/action-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateBillingInfo } from "./actions";
import { Pencil, X, Save, CheckCircle2 } from "lucide-react";

export function BillingInfoForm({ initialData }: { initialData: any }) {
    const [isEditing, setIsEditing] = useState(false);
    const [isGstRegistered, setIsGstRegistered] = useState(initialData.isGstRegistered || false);
    const [isGstVerified, setIsGstVerified] = useState(false);
    const [verifyLoading, setVerifyLoading] = useState(false);

    const handleVerifyGSTIN = () => {
        setVerifyLoading(true);
        setTimeout(() => {
            setVerifyLoading(false);
            setIsGstVerified(true);
        }, 1000);
    };

    if (!isEditing) {
        return (
            <div className="space-y-6 animate-in fade-in">
                {/* Header Text */}
                <div className="bg-card border border-border rounded-2xl p-8 shadow-sm relative group space-y-12">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-6 right-6 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setIsEditing(true)}
                    >
                        <Pencil className="w-4 h-4" />
                    </Button>

                    {/* Billing Contact */}
                    <div className="space-y-6">
                        <div className="border-b border-border pb-4">
                            <h4 className="text-sm font-bold text-foreground">Billing Contact</h4>
                            <p className="text-xs text-muted-foreground mt-1">Information used for invoices and billing communication.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase mb-1.5">Billing / Legal Name</p>
                                <p className="text-base font-medium text-foreground">{initialData.billingName}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase mb-1.5">Billing Email</p>
                                <p className="text-base font-medium text-foreground">{initialData.billingEmail}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase mb-1.5">Billing Phone</p>
                                <p className="text-base font-medium text-foreground">{initialData.billingPhone || "-"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Billing Address */}
                    <div className="space-y-6">
                        <div className="border-b border-border pb-4">
                            <h4 className="text-sm font-bold text-foreground">Billing Address</h4>
                            <p className="text-xs text-muted-foreground mt-1">Address that will appear on your invoice.</p>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase mb-1.5">Address</p>
                                <p className="text-base font-medium text-foreground whitespace-pre-wrap">{initialData.billingAddress}</p>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase mb-1.5">City</p>
                                    <p className="text-base font-medium text-foreground">{initialData.billingCity}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase mb-1.5">State</p>
                                    <p className="text-base font-medium text-foreground">{initialData.billingState}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase mb-1.5">PIN Code</p>
                                    <p className="text-base font-medium text-foreground">{initialData.billingPostalCode}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase mb-1.5">Country</p>
                                    <p className="text-base font-medium text-foreground">{initialData.billingCountry}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* GST Information */}
                    <div className="space-y-6">
                        <div className="border-b border-border pb-4">
                            <h4 className="text-sm font-bold text-foreground">GST Information</h4>
                            <p className="text-xs text-muted-foreground mt-1">Add GST details if your business is GST registered.</p>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase mb-1.5">Is your business GST registered?</p>
                                <p className="text-base font-medium text-foreground">{initialData.isGstRegistered ? "Yes" : "No"}</p>
                            </div>
                            {initialData.isGstRegistered && (
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase mb-1.5">GSTIN</p>
                                    <p className="text-base font-medium text-foreground">{initialData.gstin || "Not provided"}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Trading / Brand Name */}
                    <div className="space-y-6">
                        <div className="border-b border-border pb-4">
                            <h4 className="text-sm font-bold text-foreground">Trading / Brand Name</h4>
                            <p className="text-xs text-muted-foreground mt-1">If different from your legal billing name.</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase mb-1.5">Brand / Trading Name</p>
                            <p className="text-base font-medium text-foreground">{initialData.tradingName || "-"}</p>
                        </div>
                    </div>

                    <Button onClick={() => setIsEditing(true)} variant="outline" className="font-semibold max-w-sm w-full">Edit Billing Info</Button>
                </div>
            </div>
        );
    }

    return (
        <ActionForm
            action={async (formData: FormData) => {
                const res = await updateBillingInfo(formData);
                if (res?.success) {
                    setIsEditing(false);
                }
                return res;
            }}
            className="bg-card border border-border rounded-2xl p-8 shadow-sm relative animate-in fade-in"
        >
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-6 right-6 text-muted-foreground hover:text-foreground"
                onClick={() => setIsEditing(false)}
            >
                <X className="w-5 h-5" />
            </Button>

            <div className="space-y-12">

                {/* Billing Contact */}
                <div className="space-y-6">
                    <div className="border-b border-border pb-4">
                        <h4 className="text-sm font-bold text-foreground">Billing Contact</h4>
                        <p className="text-xs text-muted-foreground mt-1">Information used for invoices and billing communication.</p>
                    </div>
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase">Billing / Legal Name <span className="text-red-500">*</span></label>
                                <Input name="billingName" defaultValue={initialData.billingName} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase">Billing Email <span className="text-red-500">*</span></label>
                                <Input name="billingEmail" type="email" defaultValue={initialData.billingEmail} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase">Billing Phone</label>
                                <Input name="billingPhone" type="tel" defaultValue={initialData.billingPhone} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Billing Address */}
                <div className="space-y-6">
                    <div className="border-b border-border pb-4">
                        <h4 className="text-sm font-bold text-foreground">Billing Address</h4>
                        <p className="text-xs text-muted-foreground mt-1">Address that will appear on your invoice.</p>
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase">Address <span className="text-red-500">*</span></label>
                            <Textarea
                                name="billingAddress"
                                defaultValue={initialData.billingAddress}
                                required
                                rows={3}
                                className="resize-none"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase">City <span className="text-red-500">*</span></label>
                                <Input name="billingCity" defaultValue={initialData.billingCity} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase">State <span className="text-red-500">*</span></label>
                                <select
                                    name="billingState"
                                    defaultValue={initialData.billingState || ""}
                                    required
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="" disabled>Select State</option>
                                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                                    <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                                    <option value="Assam">Assam</option>
                                    <option value="Bihar">Bihar</option>
                                    <option value="Chhattisgarh">Chhattisgarh</option>
                                    <option value="Goa">Goa</option>
                                    <option value="Gujarat">Gujarat</option>
                                    <option value="Haryana">Haryana</option>
                                    <option value="Himachal Pradesh">Himachal Pradesh</option>
                                    <option value="Jharkhand">Jharkhand</option>
                                    <option value="Karnataka">Karnataka</option>
                                    <option value="Kerala">Kerala</option>
                                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                                    <option value="Maharashtra">Maharashtra</option>
                                    <option value="Manipur">Manipur</option>
                                    <option value="Meghalaya">Meghalaya</option>
                                    <option value="Mizoram">Mizoram</option>
                                    <option value="Nagaland">Nagaland</option>
                                    <option value="Odisha">Odisha</option>
                                    <option value="Punjab">Punjab</option>
                                    <option value="Rajasthan">Rajasthan</option>
                                    <option value="Sikkim">Sikkim</option>
                                    <option value="Tamil Nadu">Tamil Nadu</option>
                                    <option value="Telangana">Telangana</option>
                                    <option value="Tripura">Tripura</option>
                                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                                    <option value="Uttarakhand">Uttarakhand</option>
                                    <option value="West Bengal">West Bengal</option>
                                    <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                                    <option value="Chandigarh">Chandigarh</option>
                                    <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                                    <option value="Delhi">Delhi</option>
                                    <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                                    <option value="Ladakh">Ladakh</option>
                                    <option value="Lakshadweep">Lakshadweep</option>
                                    <option value="Puducherry">Puducherry</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase">PIN Code <span className="text-red-500">*</span></label>
                                <Input name="billingPostalCode" defaultValue={initialData.billingPostalCode} required pattern="[0-9]{6}" title="6 digit PIN code" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase">Country <span className="text-red-500">*</span></label>
                                <select
                                    name="billingCountry"
                                    defaultValue={initialData.billingCountry || "India"}
                                    required
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="India">India</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* GST Information */}
                <div className="space-y-6">
                    <div className="border-b border-border pb-4">
                        <h4 className="text-sm font-bold text-foreground">GST Information</h4>
                        <p className="text-xs text-muted-foreground mt-1">Add GST details if your business is GST registered.</p>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-4">
                            <label className="text-sm font-semibold text-foreground">Is your business GST registered?</label>
                            <input type="hidden" name="isGstRegistered" value={isGstRegistered ? "on" : ""} />
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="gst_toggle"
                                        checked={!isGstRegistered}
                                        onChange={() => setIsGstRegistered(false)}
                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                                    />
                                    <span className="text-sm text-foreground">No</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="gst_toggle"
                                        checked={isGstRegistered}
                                        onChange={() => setIsGstRegistered(true)}
                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                                    />
                                    <span className="text-sm text-foreground">Yes</span>
                                </label>
                            </div>
                        </div>

                        {isGstRegistered && (
                            <div className="space-y-4 animate-in slide-in-from-top-2 fade-in">
                                <div className="space-y-2 max-w-sm">
                                    <label className="text-xs font-bold text-muted-foreground uppercase">GSTIN <span className="text-red-500">*</span></label>
                                    <Input
                                        name="gstin"
                                        defaultValue={initialData.gstin}
                                        placeholder="19XXXXXXXXXXXXX"
                                        required={isGstRegistered}
                                        onChange={() => setIsGstVerified(false)}
                                    />
                                </div>
                                <div className="flex items-center gap-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleVerifyGSTIN}
                                        disabled={verifyLoading || isGstVerified}
                                    >
                                        {verifyLoading ? "Verifying..." : "Verify GSTIN"}
                                    </Button>
                                    {isGstVerified && (
                                        <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                                            <CheckCircle2 className="h-4 w-4" />
                                            GSTIN verified
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Trading / Brand Name */}
                <div className="space-y-6">
                    <div className="border-b border-border pb-4">
                        <h4 className="text-sm font-bold text-foreground">Trading / Brand Name</h4>
                        <p className="text-xs text-muted-foreground mt-1">If different from your legal billing name.</p>
                    </div>
                    <div className="space-y-2 max-w-md">
                        <label className="text-xs font-bold text-muted-foreground uppercase">Brand / Trading Name</label>
                        <Input name="tradingName" defaultValue={initialData.tradingName} placeholder="E.g. Mr Mahid Internet Cafe" />
                    </div>
                </div>
            </div>

            <div className="flex gap-4 pt-8 border-t mt-8">
                <Button type="submit" className="font-semibold">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="font-semibold">
                    Cancel
                </Button>
            </div>
        </ActionForm>
    );
}
