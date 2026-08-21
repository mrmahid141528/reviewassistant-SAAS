import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();
    console.log("Users:", users.length);
    for (const u of users) {
        console.log(`User: ${u.email}`);
        const members = await prisma.businessMember.findMany({ where: { userId: u.id }, include: { business: true } });
        for (const m of members) {
            console.log(`  - Member of: ${m.business.name} (Role: ${m.role})`);
            const sub = await prisma.feedbackSubmission.count({ where: { businessId: m.businessId } });
            const gen = await prisma.generatedReview.count({ where: { businessId: m.businessId } });
            console.log(`      Data: Submissions=${sub}, GeneratedReviews=${gen}`);
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
