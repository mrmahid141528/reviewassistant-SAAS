import prisma from './src/lib/prisma';

async function recover() {
    const businesses = await prisma.business.findMany({ include: { members: true } });
    const orphaned = businesses.filter(b => b.members.length === 0);

    if (orphaned.length === 0) {
        console.log("No orphaned businesses found.");
        return;
    }

    console.log("Orphaned Businesses Found:", orphaned.length);

    const users = await prisma.user.findMany();
    if (users.length > 0) {
        const mainUser = users.find(u => u.email === 'mrmahid141528@gmail.com') || users[0];

        const b = orphaned[0]; // Assuming there's only 1

        const existingMembership = await prisma.businessMember.findFirst({
            where: { businessId: b.id, userId: mainUser.id }
        });

        if (!existingMembership) {
            await prisma.businessMember.create({
                data: {
                    businessId: b.id,
                    userId: mainUser.id,
                    role: 'owner',
                    status: 'active'
                }
            });
            console.log(`Successfully re-linked orphaned business "${b.name}" to user ${mainUser.email}!`);
        } else {
            console.log(`Business "${b.name}" is already linked to user ${mainUser.email}.`);
        }
    }
}

recover().catch(e => {
    console.error("FATAL SCRIPT ERROR:")
    console.error(e.message ?? e)
});
