'use server'

import prisma from "@/lib/prisma"

export async function submitReviewDraft(rating: number, businessSlug: string) {
    try {
        const business = await prisma.business.findUnique({ where: { slug: businessSlug } });
        if (!business) return { success: false, error: "Business not found." };

        // Auto-provision campaign if missing
        let campaign = await prisma.campaign.findFirst({ where: { businessId: business.id } });
        if (!campaign) {
            campaign = await prisma.campaign.create({
                data: {
                    businessId: business.id,
                    name: "Review Campaign",
                    slug: "main-campaign"
                }
            });
        }

        const draft = generateMockReviewOffline(rating, business.name);

        // Record submission in the database
        await prisma.feedbackSubmission.create({
            data: {
                businessId: business.id,
                campaignId: campaign.id,
                rating: rating,
                status: "completed",
                reviews: {
                    create: {
                        businessId: business.id,
                        reviewText: draft,
                        rating: rating,
                    }
                }
            }
        });

        await new Promise(resolve => setTimeout(resolve, 1500));
        return { success: true, draft };
    } catch (error: unknown) {
        console.error(error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
}

function generateMockReviewOffline(rating: number, businessName: string) {
    if (rating >= 4) {
        return `I had a fantastic experience dealing with ${businessName}! Their service was professional, the staff was courteous, and everything went smoothly. Highly recommended!`;
    } else if (rating === 3) {
        return `My experience with ${businessName} was alright. They did the job, but there's definitely room for improvement in a few areas.`;
    } else {
        return `I was somewhat disappointed with my experience at ${businessName}. I hope they can improve their service quality in the future.`;
    }
}
