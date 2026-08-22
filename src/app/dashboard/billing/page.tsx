import prisma from "@/lib/prisma"
import BillingClient from "./BillingClient"

export default async function BillingPage() {
    const plans = await prisma.plan.findMany({
        where: { status: 'active' },
        orderBy: { priceMonthly: 'asc' }
    });

    return <BillingClient plans={plans} />
}
