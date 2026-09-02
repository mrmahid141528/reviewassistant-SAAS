"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Copy, Tag, ShieldCheck, Truck, Headphones, Lock, FileText, Star, Building2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { createPaymentRequest, validateCoupon } from "./actions";

export default function CheckoutClient({ plan, plans, cycle, businessId, businessName, billingConfig, initialBillingInfo }: any) {
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);
    const [completedOrder, setCompletedOrder] = useState<string | null>(null);
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<{ type: string, value: number, code: string } | null>(null);
    const [couponError, setCouponError] = useState("");
    const [step, setStep] = useState<1 | 2>(1);

    const [billingDetails, setBillingDetails] = useState({
        billingName: initialBillingInfo?.billingName || "",
        billingEmail: initialBillingInfo?.billingEmail || "",
        billingPhone: initialBillingInfo?.billingPhone || "",
        website: initialBillingInfo?.website || "",
        ownerName: initialBillingInfo?.ownerName || "",
        ownerEmail: initialBillingInfo?.ownerEmail || "",
        ownerPhone: initialBillingInfo?.billingPhone || "",
        ownerDesignation: initialBillingInfo?.ownerDesignation || "",
        gstin: initialBillingInfo?.gstin || "",
        streetAddress: initialBillingInfo?.streetAddress || "",
        city: initialBillingInfo?.city || "",
        state: initialBillingInfo?.state || "",
        pinCode: initialBillingInfo?.pinCode || "",
    });

    const basePrice = cycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;

    // Apply Discount
    let discountAmount = 0
    if (appliedCoupon) {
        if (appliedCoupon.type === 'percentage') {
            discountAmount = basePrice * (appliedCoupon.value / 100)
        } else {
            discountAmount = appliedCoupon.value
        }
    }
    const priceAfterDiscount = Math.max(0, basePrice - discountAmount);

    // Save 20% badge logic roughly based on price dif
    const hasDiscountBadge = cycle === 'yearly';

    const gstPercent = billingConfig?.gstPercentage ?? 18;
    const tax = Math.round((priceAfterDiscount * gstPercent) / 100);
    const total = Math.round(priceAfterDiscount + tax);

    const handleApplyCoupon = async () => {
        setCouponError("");
        if (!couponCode.trim()) return;

        const res = await validateCoupon(couponCode, plan.id, cycle);
        if (res.error) {
            setCouponError(res.error);
            setAppliedCoupon(null);
        } else {
            setAppliedCoupon({ type: res.type!, value: res.value!, code: couponCode });
            setCouponCode("");
        }
    }

    const handleWhatsAppPayment = async () => {
        setIsProcessing(true);

        try {
            // 1. Generate Order in Ledger
            const res = await createPaymentRequest({
                planId: plan.id,
                businessId,
                cycle,
                amount: priceAfterDiscount,
                tax,
                total
            });

            if (res.error || !res.orderNumber) throw new Error(res.error || "Order dropped");

            setCompletedOrder(res.orderNumber);

            // 2. Generate WhatsApp Deep Link
            const adminPhone = billingConfig?.whatsappNumber || process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "919000000000";

            const today = new Date();
            const formatOption: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
            const invoiceDateStr = today.toLocaleDateString('en-GB', formatOption);

            const nextPeriod = new Date(today);
            if (cycle === 'yearly') {
                nextPeriod.setFullYear(today.getFullYear() + 1);
            } else {
                nextPeriod.setMonth(today.getMonth() + 1);
            }
            nextPeriod.setDate(nextPeriod.getDate() - 1);
            const endDateStr = nextPeriod.toLocaleDateString('en-GB', formatOption);

            const displayAddress = billingDetails.streetAddress
                ? [billingDetails.streetAddress, billingDetails.city, billingDetails.state, billingDetails.pinCode].filter(Boolean).join(', ')
                : "N/A";

            const msgTemplate = `🧾 *SUBSCRIPTION PAYMENT REQUEST*

Hello, I would like to complete the payment for my subscription.

━━━━━━━━━━━━━━━━━━
📋 *BILLING DETAILS*
━━━━━━━━━━━━━━━━━━

*Business Name:* ${billingDetails.billingName || businessName || "N/A"}
*Client Name:* ${billingDetails.ownerName || "N/A"}
*Email:* ${billingDetails.billingEmail || billingDetails.ownerEmail || "N/A"}
*Phone:* ${billingDetails.billingPhone || billingDetails.ownerPhone || "N/A"}
*Billing Address:* ${displayAddress}

━━━━━━━━━━━━━━━━━━
🧾 *INVOICE DETAILS*
━━━━━━━━━━━━━━━━━━

*Invoice Date:* ${invoiceDateStr}
*Order No.:* ${res.orderNumber}

━━━━━━━━━━━━━━━━━━
📦 *SUBSCRIPTION DETAILS*
━━━━━━━━━━━━━━━━━━

*Plan:* ${plan.name}
*Billing Cycle:* ${cycle.charAt(0).toUpperCase() + cycle.slice(1)}
*Subscription Period:* ${invoiceDateStr} – ${endDateStr}

━━━━━━━━━━━━━━━━━━
💰 *PAYMENT SUMMARY*
━━━━━━━━━━━━━━━━━━

*Plan Price:* ₹${basePrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
${appliedCoupon ? `*Discount (${appliedCoupon.code}):* -₹${discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n` : ''}*Taxable Amount:* ₹${priceAfterDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
*GST (${gstPercent}%):* ₹${tax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

━━━━━━━━━━━━━━━━━━
💳 *TOTAL AMOUNT PAYABLE*
━━━━━━━━━━━━━━━━━━

*₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}*

━━━━━━━━━━━━━━━━━━
⏳ *PAYMENT STATUS*
━━━━━━━━━━━━━━━━━━

*Pending — Payment to be completed*

Please share the payment QR/details so I can complete the payment.

After making the payment, I will send the payment screenshot here for verification.

Thank you.`;

            const encodedMsg = encodeURIComponent(msgTemplate);

            // Open WhatsApp in new tab
            const cleanPhone = adminPhone.replace(/\\D/g, '');
            const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
            const newWin = window.open(whatsappUrl, '_blank');
            if (!newWin || newWin.closed || typeof newWin.closed === 'undefined') {
                window.location.href = whatsappUrl;
            }

        } catch (e: any) {
            alert(e.message || "Failed to initialize payment request");
        } finally {
            setIsProcessing(false);
        }
    }

    if (completedOrder) {
        return (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center max-w-lg mx-auto mt-16 shadow-sm">
                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                    <div className="absolute top-0 right-0 w-6 h-6 bg-emerald-100 rounded-full animate-ping opacity-75" />
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Request Sent!</h2>
                <p className="text-[15px] text-slate-500 mb-8 leading-relaxed px-4">
                    Your offline payment request has been logged. Our admins will verify your WhatsApp screenshot within 10 minutes and activate your account.
                </p>
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-center justify-between mb-8 cursor-pointer hover:bg-slate-100 transition-colors group" onClick={() => navigator.clipboard.writeText(completedOrder)}>
                    <div className="text-left">
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Order ID</p>
                        <p className="font-mono font-bold text-slate-700 mt-0.5 text-lg">{completedOrder}</p>
                    </div>
                    <Copy className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                </div>
                <Button className="w-full h-14 text-base font-bold bg-[#6366f1] text-white hover:bg-[#4f46e5] rounded-xl" onClick={() => router.push('/dashboard')}>
                    Return to Dashboard
                </Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8 xl:gap-12 items-start mt-2">
                {/* Left Side: Forms */}
                <div className="bg-white border border-slate-200/60 rounded-[20px] p-6 md:p-8 shadow-sm">
                    {step === 1 ? (
                        <>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                                    <Building2 className="w-5 h-5 text-[#6366f1]" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900">Billing & Business Details</h2>
                            </div>

                            <div className="space-y-6">
                                {/* Box 1: Business Profile */}
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 mb-4 px-1">Business Profile</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-500 px-1">Business / Organization Name</label>
                                            <Input value={billingDetails.billingName} onChange={e => setBillingDetails({ ...billingDetails, billingName: e.target.value })} className="h-[46px] rounded-xl bg-white border-slate-200 shadow-sm text-sm" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-500 px-1">Business Email</label>
                                            <Input value={billingDetails.billingEmail} onChange={e => setBillingDetails({ ...billingDetails, billingEmail: e.target.value })} className="h-[46px] rounded-xl bg-white border-slate-200 shadow-sm text-sm" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-500 px-1">Business Phone Number</label>
                                            <Input value={billingDetails.billingPhone} onChange={e => setBillingDetails({ ...billingDetails, billingPhone: e.target.value })} className="h-[46px] rounded-xl bg-white border-slate-200 shadow-sm text-sm" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-500 px-1">Website (Optional)</label>
                                            <Input value={billingDetails.website} onChange={e => setBillingDetails({ ...billingDetails, website: e.target.value })} className="h-[46px] rounded-xl bg-white border-slate-200 shadow-sm text-sm" />
                                        </div>
                                    </div>
                                </div>

                                {/* Box 2: Owner / Contact */}
                                <div className="pt-2">
                                    <h3 className="text-sm font-bold text-slate-900 mb-4 px-1">Owner / Contact Person Details</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-500 px-1">Full Name</label>
                                            <Input value={billingDetails.ownerName} onChange={e => setBillingDetails({ ...billingDetails, ownerName: e.target.value })} className="h-[46px] rounded-xl bg-white border-slate-200 shadow-sm text-sm" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-500 px-1">Email Address</label>
                                            <Input value={billingDetails.ownerEmail} onChange={e => setBillingDetails({ ...billingDetails, ownerEmail: e.target.value })} className="h-[46px] rounded-xl bg-white border-slate-200 shadow-sm text-sm" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-500 px-1">Phone Number</label>
                                            <Input value={billingDetails.ownerPhone} onChange={e => setBillingDetails({ ...billingDetails, ownerPhone: e.target.value })} className="h-[46px] rounded-xl bg-white border-slate-200 shadow-sm text-sm" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-500 px-1">Designation / Role</label>
                                            <Input value={billingDetails.ownerDesignation} onChange={e => setBillingDetails({ ...billingDetails, ownerDesignation: e.target.value })} className="h-[46px] rounded-xl bg-white border-slate-200 shadow-sm text-sm" />
                                        </div>
                                    </div>
                                </div>

                                {/* Box 3: Address */}
                                <div className="pt-2">
                                    <h3 className="text-sm font-bold text-slate-900 mb-4 px-1">Billing Address</h3>
                                    <div className="grid md:grid-cols-[1fr_2fr] gap-4 mb-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-500 px-1">GSTIN (Optional)</label>
                                            <Input value={billingDetails.gstin} onChange={e => setBillingDetails({ ...billingDetails, gstin: e.target.value })} className="h-[46px] rounded-xl bg-white border-slate-200 shadow-sm text-sm" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-500 px-1">Street Address</label>
                                            <Input value={billingDetails.streetAddress} onChange={e => setBillingDetails({ ...billingDetails, streetAddress: e.target.value })} className="h-[46px] rounded-xl bg-white border-slate-200 shadow-sm text-sm" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-500 px-1">City</label>
                                            <Input value={billingDetails.city} onChange={e => setBillingDetails({ ...billingDetails, city: e.target.value })} className="h-[46px] rounded-xl bg-white border-slate-200 shadow-sm text-sm" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-500 px-1">State</label>
                                            <Input value={billingDetails.state} onChange={e => setBillingDetails({ ...billingDetails, state: e.target.value })} className="h-[46px] rounded-xl bg-white border-slate-200 shadow-sm text-sm" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-500 px-1">PIN Code</label>
                                            <Input value={billingDetails.pinCode} onChange={e => setBillingDetails({ ...billingDetails, pinCode: e.target.value })} className="h-[46px] rounded-xl bg-white border-slate-200 shadow-sm text-sm" />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2 text-center text-xs font-medium text-emerald-600 flex items-center justify-center gap-1.5">
                                    <ShieldCheck className="w-4 h-4" /> Your information is securely encrypted and protected
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <button onClick={() => setStep(1)} className="flex items-center text-[13px] font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-6">
                                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Billing Details
                            </button>
                            <div className="mb-8">
                                <h2 className="text-2xl font-black text-slate-900 mb-1">Choose your payment method</h2>
                                <p className="text-[15px] text-slate-500">Select a payment option to complete your subscription.</p>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { name: 'Razorpay', desc: 'Secure online payments', logo: '💳' },
                                    { name: 'Cashfree', desc: 'Fast & secure payments', logo: '⚡' },
                                    { name: 'PhonePe Payment Gateway', desc: 'UPI & Cards', logo: '📱' }
                                ].map((gateway) => (
                                    <div key={gateway.name} className="flex items-center justify-between border border-slate-200 bg-slate-50/50 p-4 rounded-[16px] opacity-70 grayscale">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 flex items-center justify-center text-xl bg-slate-200 rounded-xl">
                                                {gateway.logo}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900">{gateway.name}</h4>
                                                <p className="text-[13px] text-slate-500 mt-0.5">{gateway.desc}</p>
                                            </div>
                                        </div>
                                        <div className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                                            Coming Soon
                                        </div>
                                    </div>
                                ))}

                                <div className="relative py-4 my-2">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-slate-200" />
                                    </div>
                                    <div className="relative flex justify-center text-xs font-bold uppercase text-slate-400">
                                        <span className="bg-white px-2">OR</span>
                                    </div>
                                </div>

                                <div className="border-[2px] border-emerald-500/20 bg-emerald-50/30 p-5 rounded-[16px] relative overflow-hidden transition-all hover:border-emerald-500/40">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-[#25D366]/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                                                <MessageCircle className="w-5 h-5 text-[#25D366]" />
                                            </div>
                                            <div>
                                                <h4 className="text-base font-bold text-slate-900 mb-1">Pay manually via WhatsApp</h4>
                                                <p className="text-[13px] text-slate-600 max-w-[280px] leading-relaxed">
                                                    Our team will share the payment details and confirm your payment manually.
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={handleWhatsAppPayment}
                                            disabled={isProcessing}
                                            className="w-full h-12 font-bold text-[15px] bg-[#25D366] text-white hover:bg-[#1EBE57] shadow-[0_4px_14px_rgba(37,211,102,0.25)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.3)] transition-all rounded-xl"
                                        >
                                            {isProcessing ? 'Opening WhatsApp...' : (
                                                <>
                                                    <MessageCircle className="w-5 h-5 mr-2" /> Complete Payment via WhatsApp &rarr;
                                                </>
                                            )}
                                        </Button>
                                        <p className="text-[11px] text-slate-500 text-center mt-1">
                                            By proceeding, you agree to our <a href="/legal/terms-of-service" target="_blank" className="underline hover:text-slate-800">Terms of Service</a> and <a href="/legal/refund-policy" target="_blank" className="underline hover:text-slate-800">Refund Policy</a>.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Right Side: Order Summary */}
                <div className="space-y-6 lg:sticky lg:top-6">
                    <div className="bg-white border border-slate-200/60 rounded-[20px] p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-[#6366f1]" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Order Summary</h3>
                        </div>

                        <div className="space-y-6 text-[15px]">
                            {/* Billed For */}
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Billed For</p>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-bold text-slate-900">{billingDetails.billingName || businessName}</div>
                                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                                            ID: <span className="font-mono">{businessId.slice(0, 25)}...</span>
                                            <Copy className="w-3 h-3 cursor-pointer hover:text-slate-600" onClick={() => navigator.clipboard.writeText(businessId)} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Selected Plan w/ Toggle */}
                            <div className="pt-2">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Selected Plan</p>
                                {step === 1 ? (
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-[#6366f1] rounded-xl flex items-center justify-center shadow-[0_4px_10px_rgba(99,102,241,0.3)]">
                                                <Star className="w-5 h-5 text-white fill-white" />
                                            </div>
                                            <div className="flex flex-col flex-1 pl-1">
                                                <select
                                                    value={plan.id}
                                                    onChange={(e) => router.push(`/checkout/${e.target.value}?cycle=${cycle}`)}
                                                    className="font-extrabold text-slate-900 leading-tight bg-transparent border-none p-0 pr-6 focus:ring-0 cursor-pointer text-base appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.1rem_center] bg-[length:1em_1em] w-full min-w-0 pb-1"
                                                >
                                                    {plans.map((p: any) => (
                                                        <option key={p.id} value={p.id}>{p.name}</option>
                                                    ))}
                                                </select>
                                                <div className="text-[11px] text-slate-500 -mt-0.5 pointer-events-none">Ideal for growing businesses</div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-slate-50/50 p-0.5">
                                                <button
                                                    onClick={() => cycle !== 'monthly' && router.push(`/checkout/${plan.id}?cycle=monthly`)}
                                                    className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${cycle === 'monthly' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                                                >
                                                    Monthly
                                                </button>
                                                <button
                                                    onClick={() => cycle !== 'yearly' && router.push(`/checkout/${plan.id}?cycle=yearly`)}
                                                    className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${cycle === 'yearly' ? 'bg-[#6366f1] shadow-sm text-white' : 'text-slate-500 hover:text-slate-700'}`}
                                                >
                                                    Yearly
                                                </button>
                                            </div>
                                            {hasDiscountBadge && (
                                                <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 rounded-full mt-1.5">Save 20%</span>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-start justify-between bg-slate-50 border border-slate-100 rounded-xl p-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-[#6366f1] rounded-xl flex items-center justify-center shadow-[0_4px_10px_rgba(99,102,241,0.3)]">
                                                <Star className="w-5 h-5 text-white fill-white" />
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="font-extrabold text-slate-900 leading-tight text-base">{plan.name}</div>
                                                <div className="text-[11px] text-slate-500 font-medium">{cycle.charAt(0).toUpperCase() + cycle.slice(1)} Billing</div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end justify-center h-10 pr-1">
                                            <div className="font-bold text-slate-900 text-sm">₹{basePrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                                            {hasDiscountBadge && <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 rounded-full mt-1">Save 20%</span>}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <hr className="border-dashed border-slate-200" />

                            {/* Totals */}
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm text-slate-500">
                                    <span>Subtotal</span>
                                    <span className="font-semibold text-slate-900">₹{basePrice.toFixed(2)}</span>
                                </div>
                                {appliedCoupon && (
                                    <div className="flex justify-between text-sm text-emerald-600 font-medium">
                                        <span>Discount ({appliedCoupon.code})</span>
                                        <span>-₹{discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm text-slate-500">
                                    <span>GST ({gstPercent}%)</span>
                                    <span className="font-semibold text-slate-900">₹{tax.toFixed(2)}</span>
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            <div className="flex justify-between items-center bg-slate-50 -mx-6 -mb-6 px-6 py-5 rounded-b-[20px]">
                                <span className="font-bold text-slate-900">Total Amount</span>
                                <span className="text-[28px] font-black tracking-tight text-emerald-600">₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>

                    {/* Promo Section */}
                    {step === 1 && (
                        <div className="flex items-center gap-3 bg-white border border-slate-200/60 rounded-[16px] p-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 ml-1">
                                <Tag className="w-4 h-4 text-[#6366f1]" />
                            </div>
                            <span className="text-[13px] font-semibold text-slate-700 shrink-0">Have a promo code?</span>

                            {appliedCoupon ? (
                                <div className="flex flex-1 items-center justify-end gap-2">
                                    <div className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{appliedCoupon.code} Applied</div>
                                    <Button variant="ghost" size="sm" className="h-7 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 px-2" onClick={() => setAppliedCoupon(null)}>Remove</Button>
                                </div>
                            ) : (
                                <div className="flex flex-1 items-center gap-1.5 border border-slate-200 rounded-lg p-1">
                                    <Input
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        placeholder="Enter code here"
                                        className="h-8 text-xs font-medium uppercase bg-transparent border-none shadow-none focus-visible:ring-0 px-2"
                                    />
                                    <Button size="sm" className="h-8 px-4 bg-[#6366f1]/10 text-[#6366f1] hover:bg-[#6366f1]/20 font-bold text-xs shadow-none border border-[#6366f1]/20" onClick={handleApplyCoupon}>Apply</Button>
                                </div>
                            )}
                        </div>
                    )}
                    {step === 1 && couponError && <p className="text-[11px] text-rose-500 font-bold px-2">{couponError}</p>}

                    {/* Trust Badges box */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-50/70 border border-slate-200/50 rounded-[20px] p-4 text-center">
                        <div className="flex flex-col items-center border-r border-slate-200/70">
                            <ShieldCheck className="w-6 h-6 text-emerald-500 mb-2" />
                            <p className="text-[11px] font-bold text-slate-900 leading-tight">Secure & Encrypted</p>
                            <p className="text-[10px] text-slate-500 mt-1 leading-tight px-1">Your payment is 100% safe and encrypted</p>
                        </div>
                        <div className="flex flex-col items-center border-r border-slate-200/70">
                            <Truck className="w-6 h-6 text-emerald-500 mb-2" />
                            <p className="text-[11px] font-bold text-slate-900 leading-tight">Order Tracking</p>
                            <p className="text-[10px] text-slate-500 mt-1 leading-tight px-1">We'll confirm once payment is received</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <Headphones className="w-6 h-6 text-emerald-500 mb-2" />
                            <p className="text-[11px] font-bold text-slate-900 leading-tight">Need Help?</p>
                            <p className="text-[10px] text-slate-500 mt-1 leading-tight px-1">Contact our support team anytime</p>
                        </div>
                    </div>

                    {step === 1 && (
                        <Button
                            onClick={() => setStep(2)}
                            className="w-full h-14 font-extrabold text-[15px] bg-[#6366f1] text-white hover:bg-[#4f46e5] shadow-[0_4px_14px_rgba(99,102,241,0.25)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.3)] transition-all rounded-xl"
                        >
                            <Lock className="w-4 h-4 mr-2" /> Continue to Payment &rarr;
                        </Button>
                    )}

                    <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-slate-500 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Secured by
                        <span className="font-bold text-slate-900 px-1 border-r border-slate-300 pr-2">Razorpay</span>
                        <span className="font-bold text-slate-900 px-1 border-r border-slate-300 pr-2">VISA</span>
                        <span className="font-bold text-slate-900 px-1 border-r border-slate-300 pr-2">MasterCard</span>
                        <span className="font-bold text-slate-900 pl-1">UPI</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
