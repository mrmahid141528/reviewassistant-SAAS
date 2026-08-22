const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.user.findMany({ select: { id: true, email: true, name: true } })
    .then(u => { console.log(JSON.stringify(u, null, 2)); p.$disconnect(); })
    .catch(e => { console.error(e); p.$disconnect(); });
