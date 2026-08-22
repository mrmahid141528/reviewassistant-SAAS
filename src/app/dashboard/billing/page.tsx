"use client"

import { useState } from "react"
import { useTransition } from "react"
import Script from "next/script"

export default function BillingPage() {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    const handleUpgrade = () => {
        setError(null)
        startTransition(async () => {
            try {
                // Fetch the subscription ID from our server backend securely
                const res = await fetch("/api/razorpay/checkout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ planId: "plan_sample123" }) // Usually dynamic, hardcoded for demonstration phase
                })

                if (!res.ok) {
                    const data = await res.json()
                    throw new Error(data.error || "Failed to initiate checkout")
                }

                const { subscriptionId } = await res.json()

                // Razorpay standard checkout configuration
                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Use Razorpay test/prod public key
                    subscription_id: subscriptionId,
                    name: "SaaS Platform Pro",
                    description: "Unlimited review campaigns and metrics",
                    handler: function (response: any) {
                        alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`)
                        window.location.reload()
                    },
                    theme: {
                        color: "#2563EB"
                    }
                }

                // @ts-ignore
                const rzp = new window.Razorpay(options)
                rzp.open()

            } catch (err: any) {
                setError(err.message)
            }
        })
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto pt-6">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />

            <div>
                <h1 className="text-3xl font-bold tracking-tight">Billing & Plans</h1>
                <p className="text-muted-foreground mt-1">Manage your active subscription seamlessly.</p>
            </div>

            <div className="bg-white border rounded-xl p-8 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Current Plan</h2>
                        <p className="text-sm mt-1 text-gray-500">You are currently on the <strong className="text-gray-800">Free Tier</strong>.</p>
                        {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}
                    </div>
                    <div className="text-right">
                        <span className="inline-flex items-center rounded-md bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-600 ring-1 ring-inset ring-gray-500/10 uppercase tracking-widest">
                            Incomplete
                        </span>
                    </div>
                </div>

                <div className="mt-8 border-t pt-8">
                    <h3 className="font-semibold text-gray-900 mb-4">Available Upgrade</h3>
                    <div className="flex border border-blue-200 bg-blue-50/50 rounded-lg p-6 relative">
                        <div className="absolute top-0 right-0 py-1 px-3 bg-blue-600 text-white font-bold text-xs rounded-bl-lg rounded-tr-lg">POPULAR</div>
                        <div className="flex-1">
                            <h4 className="font-bold text-lg text-blue-900">SaaS Pro (Monthly)</h4>
                            <p className="text-sm text-blue-700/80 mt-1 mb-4">Unlock unlimited automation capabilities, detailed metrics, and priority deployment flows.</p>
                            <ul className="text-sm space-y-2 text-blue-800/90 mb-6">
                                <li className="flex items-center gap-2">✓ Unlimited Review Generation Requests</li>
                                <li className="flex items-center gap-2">✓ Dynamic Custom Survey Forms</li>
                                <li className="flex items-center gap-2">✓ Direct Automation Pipeline</li>
                            </ul>
                        </div>
                        <div className="flex flex-col justify-center items-end ml-4">
                            <p className="text-3xl font-bold text-blue-900 mb-4">₹1,999<span className="text-sm text-blue-600">/mo</span></p>
                            <button
                                onClick={handleUpgrade}
                                disabled={isPending}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
                            >
                                {isPending ? "Validating..." : "Upgrade to Pro"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
