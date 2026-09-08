import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function main() {
    console.log("Migrating orphaned AI settings to Primary Campaigns...");

    // Get all businesses
    const businesses = await prisma.business.findMany({
        include: { campaigns: { orderBy: { createdAt: 'asc' } } }
    });

    for (const b of businesses) {
        if (b.campaigns.length < 2) continue; // No orphaned campaigns

        const primaryCampaign = b.campaigns[0];
        let hasValidSettingsInPrimary = false;

        const currentSettings = primaryCampaign.settings as any;
        if (currentSettings && currentSettings.aiTone && currentSettings.aiLanguage) {
            hasValidSettingsInPrimary = true;
        }

        if (!hasValidSettingsInPrimary) {
            // Find the most recently updated campaign that HAS settings
            const orphanedWithSettings = [...b.campaigns].reverse().find((c: any) => {
                const s = c.settings as any;
                return s && s.aiLanguage;
            });

            if (orphanedWithSettings) {
                console.log(`Copying settings for business ${b.name} from orphaned ${orphanedWithSettings.id} to primary ${primaryCampaign.id}`);

                await prisma.campaign.update({
                    where: { id: primaryCampaign.id },
                    data: { settings: orphanedWithSettings.settings }
                });
            }
        }
    }
    console.log("Migration complete.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
