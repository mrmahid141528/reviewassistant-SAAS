import { PrismaClient } from "@prisma/client"
import { randomUUID } from "node:crypto"

const prisma = new PrismaClient()

async function main() {
    console.log("Starting debug diagnostics...")

    const businesses = await prisma.business.findMany({ select: { id: true, name: true, razorpayPlanId: true } })
    console.log("Businesses:", businesses)

    const subs = await prisma.subscription.findMany()
    console.log("Subscriptions Table:", subs)

    if (businesses.length > 0 && businesses[0].razorpayPlanId) {
        console.log("Attempting to query manually with the plan logic for", businesses[0].name)
    }

}

main().catch(e => console.error("TEST SCRIPT ERROR:", e)).finally(() => prisma.$disconnect())
