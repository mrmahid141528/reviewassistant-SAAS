import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import RequestsClient from "./RequestsClient"

export default async function PaymentRequestsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect("/login")

    const SUPER_ADMIN_EMAILS = ["mrmahid141528@gmail.com"];
    if (!user.email || !SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase())) {
        redirect("/dashboard")
    }

    const pendingOrders = await prisma.order.findMany({
        where: { status: 'PENDING' },
        include: {
            business: { select: { name: true } },
            plan: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
    });

    // Make decimal serializable for Next router
    const serializableOrders = pendingOrders.map((order: any) => ({
        ...order,
        amount: Number(order.amount),
        tax: Number(order.tax),
        total: Number(order.total)
    }));

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Payment Requests</h1>
                <p className="text-muted-foreground mt-2">
                    Review and verify offline payments received via WhatsApp. Approving an order automatically activates the linked Business Subscription.
                </p>
            </div>

            <RequestsClient orders={serializableOrders} />
        </div>
    )
}
