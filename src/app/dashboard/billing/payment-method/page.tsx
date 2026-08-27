import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function PaymentMethodPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const membership = await prisma.businessMember.findFirst({
        where: { userId: user.id },
        include: { business: true }
    });

    if (!membership) redirect("/dashboard");

    const business = membership.business;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <h3 className="text-sm font-bold tracking-widest text-muted-foreground uppercase ml-1">PAYMENT METHOD</h3>
            <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                {business.razorpayCustomerId ? (
                    <>
                        <div className="flex gap-4 mb-8">
                            <div className="h-14 w-14 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                                <CreditCard className="h-7 w-7 text-blue-600" />
                            </div>
                            <div>
                                <p className="font-bold text-foreground text-lg">Razorpay Gateway</p>
                                <p className="text-sm text-muted-foreground font-medium mt-1">Customer ID: {business.razorpayCustomerId}</p>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full font-semibold max-w-sm">Manage on Razorpay Portal</Button>
                    </>
                ) : (
                    <div className="text-center py-10">
                        <CreditCard className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                        <p className="text-muted-foreground text-sm font-medium">
                            No payment method attached. Payments are managed securely via our Razorpay integration upon upgrading.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
