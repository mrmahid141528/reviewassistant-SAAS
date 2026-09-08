import pg from 'pg';
import * as dotenv from 'dotenv';
import fs from 'fs/promises';

dotenv.config({ path: '.env.local' });
dotenv.config();

const { Pool } = pg;
const connectionString = process.env.DATABASE_POOL_URL || process.env.DATABASE_URL;

const pool = new Pool({ connectionString });

async function main() {
    const client = await pool.connect();
    try {
        const res = await client.query("SELECT id, name, settings FROM campaigns");
        await fs.writeFile('db-output.json', JSON.stringify(res.rows, null, 2));
    } catch (e) {
        console.error("SQL Error:", e);
    } finally {
        client.release();
        await pool.end();
    }
}

main();
