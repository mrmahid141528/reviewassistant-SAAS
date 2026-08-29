'use server'

import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

const SUPER_ADMIN = "mrmahid141528@gmail.com"

async function checkAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email?.toLowerCase() !== SUPER_ADMIN) {
        throw new Error("Unauthorized")
    }
}

export async function updateBrandSettings(formData: FormData) {
    try {
        await checkAdmin();

        const platformName = formData.get("platformName") as string || "Google Review Assistant";

        let finalLogoUrl: string | null = formData.get("currentLogoUrl") as string || null;

        let finalLogoBuffer: Buffer | null = null;
        let finalMimeType: string | null = null;

        const logoFile = formData.get("logo") as File | null;
        if (logoFile && logoFile.size > 0 && logoFile.name !== "undefined") {
            const arrayBuffer = await logoFile.arrayBuffer()
            finalLogoBuffer = Buffer.from(arrayBuffer)
            finalMimeType = logoFile.type;
        } else {
            const base64Str = formData.get("logoBase64") as string | null;
            if (base64Str) {
                finalLogoBuffer = Buffer.from(base64Str, 'base64');
                finalMimeType = (formData.get("logoMimeType") as string) || "image/jpeg";
            }
        }

        if (finalLogoBuffer && finalMimeType) {
            const fileExt = finalMimeType.split('/')[1] || 'png';
            const fileName = `platform-logo-${Date.now()}.${fileExt}`;

            const { createClient: createSupabaseClient } = require('@supabase/supabase-js')
            const supabaseAdmin = createSupabaseClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            )

            const { data: bucketData, error: bucketError } = await supabaseAdmin.storage.getBucket('platform-assets')
            if (bucketError) {
                await supabaseAdmin.storage.createBucket('platform-assets', { public: true })
            }

            const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
                .from('platform-assets')
                .upload(fileName, finalLogoBuffer, {
                    upsert: true,
                    contentType: finalMimeType
                })

            if (uploadError) {
                throw new Error("Failed to upload platform logo to storage.");
            }

            const { data: publicUrlData } = supabaseAdmin.storage
                .from('platform-assets')
                .getPublicUrl(fileName)

            finalLogoUrl = publicUrlData.publicUrl;
        }

        const valuePayload = {
            platformName,
            logoUrl: finalLogoUrl
        }

        await prisma.platformSetting.upsert({
            where: { key: 'brand_settings' },
            create: {
                key: 'brand_settings',
                value: valuePayload
            },
            update: {
                value: valuePayload
            }
        });

        revalidatePath("/", "layout");

        return { success: true, message: "Platform branding saved successfully!" }
    } catch (e: any) {
        return { error: e.message || "An unexpected error occurred." }
    }
}
