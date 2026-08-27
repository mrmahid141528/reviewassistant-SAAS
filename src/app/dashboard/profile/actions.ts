'use server'

import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { logAudit } from "@/lib/auditLogger"

export async function updateProfile(formData: FormData) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return { error: "Authentication failed. Not logged in." }

        const name = formData.get("name") as string || ""
        const email = formData.get("email") as string || ""
        const phone = formData.get("phone") as string || ""
        const language = formData.get("language") as string || "English"

        let finalAvatarUrl = undefined;
        const avatarFile = formData.get("avatar") as File | null;

        if (avatarFile && avatarFile.size > 0 && avatarFile.name && avatarFile.name !== "undefined") {
            const fileExt = avatarFile.name.split('.').pop()
            const fileName = `user-${user.id}-${Date.now()}.${fileExt}`

            const { createClient: createSupabaseClient } = require('@supabase/supabase-js')
            const supabaseAdmin = createSupabaseClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            )

            const arrayBuffer = await avatarFile.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)

            // Ensure "avatars" bucket exists
            const { data: bucketData, error: bucketError } = await supabaseAdmin.storage.getBucket('avatars')
            if (bucketError) {
                // If it doesn't exist, try creating it
                await supabaseAdmin.storage.createBucket('avatars', { public: true })
            }

            const { error: uploadError } = await supabaseAdmin.storage
                .from('avatars')
                .upload(fileName, buffer, {
                    upsert: true,
                    contentType: avatarFile.type
                })

            if (uploadError) {
                console.error("Storage upload error:", uploadError)
                return { error: "Failed to upload avatar: " + uploadError.message }
            }

            const { data: publicUrlData } = supabaseAdmin.storage
                .from('avatars')
                .getPublicUrl(fileName)

            finalAvatarUrl = publicUrlData.publicUrl
        }

        const removeAvatar = formData.get("removeAvatar") === "true";

        const updateData: any = { name }
        if (finalAvatarUrl) {
            updateData.image = finalAvatarUrl
        } else if (removeAvatar) {
            updateData.image = null
        }

        // Update Prisma User
        await prisma.user.update({
            where: { id: user.id },
            data: updateData
        })

        // Update Supabase Auth if email or user_metadata changed
        const authUpdates: any = {}
        if (email !== user.email) {
            authUpdates.email = email
        }
        authUpdates.data = { language }

        const { error: authError } = await supabase.auth.updateUser(authUpdates)

        if (authError) {
            console.error("Auth update error:", authError)
            return { error: authError.message || "Failed to update email in authentication." }
        }

        revalidatePath("/dashboard/profile")

        await logAudit({
            actorType: 'business_owner',
            actorId: user.id,
            action: 'Updated User Profile',
            resourceType: 'user',
            resourceId: user.id,
            afterData: { name, email, phone, language, hasAvatar: !!finalAvatarUrl }
        })

        if (email !== user.email) {
            return { success: true, message: "Profile updated! A confirmation email has been sent to your new email address." }
        }

        return { success: true, message: "Profile saved successfully!" }
    } catch (e: any) {
        console.error("Error in updateProfile:", e)
        return { error: e.message || "An unexpected error occurred." }
    }
}
