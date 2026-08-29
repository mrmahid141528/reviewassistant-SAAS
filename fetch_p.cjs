require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const plans = await prisma.plan.findMany();
    console.log("PLANS:", plans.map(p => ({ slug: p.slug, status: p.status })));
}

check();
