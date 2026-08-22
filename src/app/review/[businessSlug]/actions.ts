'use server'

import prisma from "@/lib/prisma"

export async function submitReviewDraft(rating: number, answers: object, businessSlug: string) {
    try {
        const business = await prisma.business.findUnique({ where: { slug: businessSlug } });
        if (!business) return { success: false, error: "Business not found." };

        // Determine AI generation limits based on the active Plan
        let maxGenerations = 50; // Default Free/Starter tier limit
        if (business.razorpayPlanId) {
            const plan = await prisma.plan.findUnique({ where: { id: business.razorpayPlanId } });
            if (plan && plan.limits) {
                maxGenerations = (plan.limits as any).maxGenerations ?? 50;
            }
        }

        let skipAI = false;
        if (maxGenerations !== -1) {
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            const generatedThisMonth = await prisma.generatedReview.count({
                where: {
                    businessId: business.id,
                    createdAt: { gte: startOfMonth }
                }
            });

            if (generatedThisMonth >= maxGenerations) {
                skipAI = true;
            }
        }

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

        const questions = await prisma.campaignQuestion.findMany({ where: { campaignId: campaign.id } });
        const answersRecord = answers as Record<string, string>;
        const qnaPairs = questions.map(q => ({
            question: q.question,
            answer: answersRecord[q.id] || "Skipped/No answer"
        }));

        const currentSettings = (campaign.settings as any) || {}

        const draft = await generateGeminiReview(rating, business.name, qnaPairs, currentSettings, skipAI);

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

        const googleUrl = currentSettings.googleReviewUrl || ""

        return { success: true, draft, googleUrl };
    } catch (error: unknown) {
        console.error(error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
}

async function generateGeminiReview(rating: number, businessName: string, qnaPairs: { question: string, answer: string }[], settings: any, skipAI: boolean) {
    if (skipAI) return generateMockReviewOffline(rating, businessName);

    const aiLanguage = settings?.aiLanguage || "English";
    const aiTone = settings?.aiTone || "Professional & Friendly";

    const prompt = `
You are an expert, authentic Google Review writer. Write a Google Review for a business named "${businessName}".
The customer has given this business a rating of ${rating} out of 5 stars.
Here are the customer's specific answers to questions about their experience:
${qnaPairs.map(pair => `Q: ${pair.question}\nA: ${pair.answer}`).join('\n\n')}

Guidelines:
- Write the review entirely from the perspective of the customer.
- Tone: ${aiTone}
- Language: ${aiLanguage}
- Length: Keep it concise and natural, around 2 to 4 sentences.
- VERY IMPORTANT: Do NOT include any introductory or concluding text (like "Here is a review" or "Here you go"). Output ONLY the exact text of the review.
`;

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) return generateMockReviewOffline(rating, businessName);

    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await res.json();
        const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (generatedText) return generatedText.trim();
    } catch (e) {
        console.error("Gemini API Error:", e);
    }

    return generateMockReviewOffline(rating, businessName);
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
