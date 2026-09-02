"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Copy, FileText, Smartphone, ShieldCheck, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { createPaymentRequest, validateCoupon } from "./actions";

export default function CheckoutClient({ plan, plans, cycle, businessId, businessName, billingConfig }: any) {
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);
    const [completedOrder, setCompletedOrder] = useState<string | null>(null);
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<{ type: string, value: number, code: string } | null>(null);
    const [couponError, setCouponError] = useState("");

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

    const gstPercent = billingConfig?.gstPercentage ?? 18;
    const tax = Math.round(priceAfterDiscount * (gstPercent / 100));
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

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleOnlinePayment = async () => {
        setIsProcessing(true);
        try {
            const res = await fetch("/api/razorpay/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planId: plan.id, cycle, total })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) throw new Error("Razorpay SDK failed to load");

            const options = {
                key: data.keyId,
                amount: data.amount,
                currency: "INR",
                name: businessName,
                description: `Subscription: ${plan.name} (${cycle})`,
                order_id: data.orderId,
                handler: async function (response: any) {
                    setIsProcessing(true);
                    const verifyRes = await fetch("/api/razorpay/verify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            ...response,
                            planId: plan.id,
                            cycle
                        })
                    });
                    if (verifyRes.ok) {
                        alert("Payment successful! Plan upgraded.");
                        router.push('/dashboard');
                    } else {
                        alert("Payment verification failed.");
                        setIsProcessing(false);
                    }
                },
                theme: { color: "#0f172a" }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                alert("Payment Failed: " + response.error.description);
            });
            rzp.open();

        } catch (e: any) {
            alert(e.message || "Failed to initialize online payment");
        } finally {
            setIsProcessing(false);
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
            const encodedMsg = encodeURIComponent(
                `Hello, I would like to activate my SaaS subscription.\n\n` +
                `*Order Number:* ${res.orderNumber}\n` +
                `*Account ID:* ${businessId}\n` +
                `*Business Name:* ${businessName}\n` +
                `*Plan selected:* ${plan.name} (${cycle})\n` +
                `*Subtotal:* ₹${basePrice}\n` +
                (appliedCoupon ? `*Discount (${appliedCoupon.code}):* -₹${Math.round(discountAmount)}\n` : '') +
                `*GST ${gstPercent}%: * ₹${tax}\n` +
                `*Total Paid:* ₹${total}\n\n` +
                `*Please find my payment screenshot attached.*`
            );

            // Open WhatsApp in new tab
            window.open(`https://wa.me/${adminPhone}?text=${encodedMsg}`, '_blank');

        } catch (e: any) {
            alert(e.message || "Failed to initialize payment request");
        } finally {
            setIsProcessing(false);
        }
    }

    if (completedOrder) {
        return (
            <div className="bg-card border rounded-3xl p-10 text-center max-w-lg mx-auto mt-10 shadow-xl">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Request Sent!</h2>
                <p className="text-muted-foreground mb-8">
                    Your offline payment request has been logged. Our admins will verify your WhatsApp screenshot within 10 minutes and activate your account.
                </p>
                <div className="bg-muted p-4 rounded-xl flex items-center justify-between mb-8 cursor-pointer hover:bg-muted/80 transition-colors" onClick={() => navigator.clipboard.writeText(completedOrder)}>
                    <div className="text-left">
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Order ID</p>
                        <p className="font-mono font-bold mt-1 text-lg">{completedOrder}</p>
                    </div>
                    <Copy className="w-5 h-5 text-muted-foreground" />
                </div>
                <Button className="w-full h-12 text-lg font-bold" onClick={() => router.push('/dashboard')}>
                    Return to Dashboard
                </Button>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto pt-6">
            <button onClick={() => router.back()} className="flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Plans
            </button>

            <div className="grid md:grid-cols-5 gap-8">
                {/* Left side: Invoice Document */}
                <div className="md:col-span-3 space-y-6">
                    <h1 className="text-3xl font-bold tracking-tight">Complete your payment</h1>
                    <p className="text-muted-foreground">You have selected the offline payment method. Please review your order summary below.</p>

                    <div className="bg-card border rounded-2xl p-6 shadow-sm mt-4">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                            <FileText className="w-6 h-6 text-primary" />
                            <h3 className="text-xl font-bold">Proforma Invoice</h3>
                        </div>

                        <div className="space-y-4 text-sm mb-8">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Billed For</span>
                                <span className="font-medium text-right">{businessName}<br /><span className="text-xs text-muted-foreground font-mono">{businessId}</span></span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Selected Plan</span>
                                <div className="flex items-center gap-2">
                                    <select
                                        className="h-8 rounded-md border text-sm font-medium bg-background px-2 focus:ring-1 focus:ring-primary"
                                        value={plan.id}
                                        onChange={(e) => {
                                            router.push(`/dashboard/billing/checkout/${e.target.value}?cycle=${cycle}`);
                                        }}
                                    >
                                        {plans?.map((p: any) => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider">{cycle}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-dashed">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Subtotal</span>
                                <span>₹{basePrice}</span>
                            </div>
                            {appliedCoupon && (
                                <div className="flex justify-between text-emerald-600 font-medium">
                                    <span>Discount ({appliedCoupon.code})</span>
                                    <span>-₹{Math.round(discountAmount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-muted-foreground">
                                <span>GST ({gstPercent}%)</span>
                                <span>₹{tax}</span>
                            </div>
                            <div className="flex justify-between font-bold text-xl pt-4 mt-4 border-t text-foreground">
                                <span>Total Amount</span>
                                <span>₹{total}</span>
                            </div>
                        </div>

                        {/* Coupon Section */}
                        <div className="pt-4 border-t border-dashed">
                            <label className="text-[12px] font-semibold text-slate-500 flex items-center mb-2">
                                <Tag className="w-3 h-3 mr-1" /> DISCOUNT CODE
                            </label>
                            {appliedCoupon ? (
                                <div className="flex items-center justify-between bg-emerald-50 text-emerald-700 px-3 py-2 rounded-md border border-emerald-200">
                                    <div className="text-sm font-medium">{appliedCoupon.code} Applied!</div>
                                    <Button variant="ghost" size="sm" className="h-6 px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50" onClick={() => setAppliedCoupon(null)}>Remove</Button>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex gap-2">
                                        <Input
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                            placeholder="Enter code..."
                                            className="h-9 text-sm uppercase"
                                        />
                                        <Button variant="secondary" className="h-9" onClick={handleApplyCoupon}>Apply</Button>
                                    </div>
                                    {couponError && <p className="text-xs text-rose-500 mt-1">{couponError}</p>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right side: Payment Actions */}
                <div className="md:col-span-2">
                    <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-6 shadow-sm h-full flex flex-col justify-center text-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm mb-6 pb-0">
                            <svg viewBox="0 0 24 24" className="w-9 h-9 fill-[#25D366]"><path d="M11.996 2.002a9.98 9.98 0 00-8.5 4.793l-1.393 5.342 5.518-1.44a9.972 9.972 0 004.375 1.01h.004a9.982 9.982 0 009.98-9.98A9.98 9.98 0 0011.996 2.002zm5.727 14.156c-1.373-.02-1.92-1.282-1.92-1.282-.132-.236-.307-.367-.5-.45a1.867 1.867 0 00-1.85.204 4.544 4.544 0 01-.157.142c-.225.178-.456.248-.737.106-1.57-.796-2.585-1.573-3.626-3.13-.158-.236-.12-.48.056-.67.14-.15.28-.328.41-.51.19-.27.24-.51.1-.9-.12-.34-.58-1.55-.83-2.12-.24-.55-.47-.46-.66-.46-.17 0-.39-.02-.59-.02-.27 0-.64.08-.94.42-.48.55-1.48 1.4-1.48 3.51 0 2.11 1.5 4.14 1.7 4.41.22.29 2.92 4.67 7.21 6.35.9.36 1.63.56 2.21.73.91.26 1.74.22 2.4.14.73-.09 2.24-.96 2.56-1.87.32-.9.32-1.68.21-1.85z" /></svg>
                        </div>

                        <h3 className="font-bold text-lg mb-2">Secured Offline Processing</h3>
                        <p className="text-sm text-muted-foreground mb-8">
                            Complete your payment manually via UPI or Bank Transfer. Share screenshot on our Official WhatsApp to activate instantly.
                        </p>

                        <div className="space-y-4 w-full">
                            <Button
                                onClick={handleOnlinePayment}
                                disabled={isProcessing}
                                className="w-full h-12 font-bold mb-2 transition-all shadow-[0_4px_14px_rgba(15,23,42,0.39)]"
                            >
                                {isProcessing ? 'Connecting gateway...' : 'Pay Securely Online (Razorpay)'}
                            </Button>

                            <div className="relative pb-2">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-border/40" />
                                </div>
                                <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
                                    <span className="bg-card px-2 text-muted-foreground/60">OR MANUAL INVOICE</span>
                                </div>
                            </div>

                            <Button
                                onClick={handleWhatsAppPayment}
                                disabled={isProcessing}
                                variant="outline"
                                className="w-full h-12 font-bold transition-all border-green-500/20 hover:bg-green-500/10 hover:text-green-600 text-green-700"
                            >
                                <Smartphone className="w-4 h-4 mr-2" /> Request Manual Activation
                            </Button>
                            <p className="text-xs text-muted-foreground flex items-center justify-center">
                                <ShieldCheck className="w-3 h-3 mr-1" /> Orders tracked securely
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
