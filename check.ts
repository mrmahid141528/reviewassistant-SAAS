import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()

async function main() {
    try {
        const count = await p.plan.count()
        console.log("TABLE_EXISTS_COUNT:", count)
    } catch (e: any) {
        console.error("TABLE_MISSING:", e.message)
    } finally {
        await p.$disconnect()
    }
}
main()
