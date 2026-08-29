import prisma from "@/lib/prisma"
import { BrandingClient } from "./BrandingClient"

export const dynamic = 'force-dynamic'

export default async function SuperAdminBrandingPage() {
    const settingsObj = await prisma.platformSetting.findUnique({
        where: { key: 'brand_settings' }
    });

    const parsedSettings = settingsObj && settingsObj.value && typeof settingsObj.value === 'object'
        ? (settingsObj.value as any)
        : {};

    return <BrandingClient initialSettings={parsedSettings} />
}
