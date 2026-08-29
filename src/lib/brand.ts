import prisma from "@/lib/prisma"
import { cache } from "react"

export const getBrandSettings = cache(async () => {
    try {
        const settingsObj = await prisma.platformSetting.findUnique({
            where: { key: 'brand_settings' }
        });
        if (settingsObj?.value && typeof settingsObj.value === 'object') {
            return settingsObj.value as { platformName?: string, logoUrl?: string };
        }
    } catch (e) { }
    return { platformName: "Google Review Assistant", logoUrl: null };
});
