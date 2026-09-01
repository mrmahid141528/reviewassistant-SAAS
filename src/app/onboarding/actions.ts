'use server'

import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'

export async function completeOnboarding(formData: FormData) {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return { error: 'Unauthorized: Please log in again.' }
    }

    try {
        const businessName = formData.get('businessName') as string || 'My Business'
        const category = formData.get('category') as string || 'Other'
        const phone = formData.get('phone') as string
        const website = formData.get('website') as string
        const address = formData.get('address') as string
        const city = formData.get('city') as string
        const state = formData.get('state') as string
        const country = formData.get('country') as string
        const googleReviewLink = formData.get('googleReviewLink') as string

        const aiLanguage = formData.get('aiLanguage') as string || 'English'
        const aiTone = formData.get('aiTone') as string || 'Natural'
        const aiLength = formData.get('aiLength') as string || 'Medium'

        const slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 6)

        // Run in transaction to assure atomicity
        await prisma.$transaction(async (tx) => {
            // 1. Create Business
            const business = await tx.business.create({
                data: {
                    name: businessName,
                    slug,
                    category,
                    phone,
                    websiteUrl: website,
                    settings: {
                        aiPreferences: {
                            language: aiLanguage,
                            tone: aiTone,
                            length: aiLength
                        }
                    }
                }
            })

            // 2. Link User to Business
            await tx.businessMember.create({
                data: {
                    businessId: business.id,
                    userId: user.id,
                    role: 'owner',
                    status: 'active',
                    joinedAt: new Date() // Fix: Add joinedAt Date because Prisma expects DateTime? for default behavior without it failing on non-null assertions sometimes with relation fields depending on setup.
                }
            })

            // 3. Create Business Location (Required for the Google link)
            const location = await tx.businessLocation.create({
                data: {
                    businessId: business.id,
                    name: 'Main Location',
                    address,
                    city,
                    state,
                    country,
                    phone,
                    isMain: true
                }
            })

            // 4. Create initial Campaign (Permanent QR / review link reference)
            await tx.campaign.create({
                data: {
                    businessId: business.id,
                    locationId: location.id,
                    name: 'Default Review Flow',
                    slug: slug, // This makes the campaign slug visually the same as the business but can be independently queried
                    settings: {
                        googleReviewUrl: googleReviewLink,
                    }
                }
            })
        }, {
            maxWait: 10000, // 10s max wait for a connection
            timeout: 20000  // 20s max for the transaction itself
        })

        return { success: true, slug: slug }
    } catch (error: any) {
        console.error("Onboarding setup failed:", error)
        return { error: `Failed to complete setup: ${error?.message || 'Unknown server error'}` }
    }
}
