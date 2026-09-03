const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    const b = await prisma.business.findMany({ select: { id: true, name: true, logoUrl: true } });
    console.log(JSON.stringify(b, null, 2));

    const c = await prisma.platformSetting.findMany({ where: { key: 'brand_settings' } });
    console.log(JSON.stringify(c, null, 2));

    await prisma.$disconnect();
}
run();
