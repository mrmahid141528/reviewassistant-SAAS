import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
    const connectionString = process.env.DATABASE_POOL_URL || process.env.DATABASE_URL
    const pool = new Pool({ connectionString })
    const adapter = new PrismaPg(pool)
    return new PrismaClient({ adapter })
}

declare global {
    var prismaGlobal_v3: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal_v3 ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal_v3 = prisma
