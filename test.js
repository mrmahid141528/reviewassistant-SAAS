const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    try {
        const biz = await prisma.business.findFirst();
        const plan = await prisma.plan.findFirst();

        console.log(`Using Business: ${biz.id}, Plan: ${plan.id}`);

        const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

        const result = await prisma.$transaction(async (tx) => {
            console.log("Creating Order...");
            const order = await tx.order.create({
                data: {
                    orderNumber,
                    businessId: biz.id,
                    planId: plan.id,
                    amount: 999,
                    tax: 180,
                    total: 1179,
                    billingCycle: 'monthly',
                    status: 'PENDING',
                    paymentMethod: 'WHATSAPP'
                }
            });

            console.log("Finding Subscription...");
            let sub = await tx.subscription.findFirst({
                where: { businessId: biz.id, status: { in: ['active', 'trialing'] } }
            });

            if (!sub) {
                console.log("Creating Subscription...");
                sub = await tx.subscription.create({
                    data: {
                        businessId: biz.id,
                        planId: plan.id,
                        provider: 'MANUAL',
                        providerSubscriptionId: `SUB-${orderNumber}`,
                        status: 'PAYMENT_PENDING',
                        currentPeriodStart: new Date(),
                        currentPeriodEnd: new Date()
                    }
                });
            } else {
                console.log("Updating Subscription...");
                await tx.subscription.update({
                    where: { id: sub.id },
                    data: { status: 'PAYMENT_PENDING' }
                });
            }

            return order;
        });
        console.log("SUCCESS:", result);
    } catch (e) {
        console.error("ERROR CAUGHT:");
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
run();
