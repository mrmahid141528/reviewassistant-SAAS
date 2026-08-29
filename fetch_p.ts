import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    const plans = await prisma.plan.findMany();
    console.log("ALL PLANS IN DB:", plans.map(p => ({
        name: p.name,
        slug: p.slug,
        status: p.status,
        priceMonthly: p.priceMonthly
    })));
}

check();
