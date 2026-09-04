'use server'

import prisma from "@/lib/prisma"

export async function submitReviewDraft(rating: number, answers: object, businessSlug: string) {
    try {
        const business = await prisma.business.findUnique({ where: { slug: businessSlug } });
        if (!business) return { success: false, error: "Business not found." };

        // Determine AI generation limits based on the active Plan
        let maxGenerations = 50; // Default Free/Starter tier limit
        let isExpired = false;

        if (business.razorpayPlanId) {
            const plan = await prisma.plan.findUnique({ where: { id: business.razorpayPlanId } });
            if (plan && plan.limits) {
                maxGenerations = (plan.limits as any).maxGenerations ?? 50;
            }
        } else {
            // Null Plan -> Evaluate Free Trial Period Constraints
            const daysSinceCreated = (Date.now() - business.createdAt.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceCreated > 7) {
                isExpired = true;
                maxGenerations = 0; // Frozen completely
            }
        }

        let skipAI = false;
        if (isExpired) {
            skipAI = true;
        } else if (maxGenerations !== -1) {
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

        const generatedResult = await generateGeminiReview(rating, business.name, qnaPairs, currentSettings, business.settings, skipAI);

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
                        reviewText: generatedResult.text,
                        provider: generatedResult.provider,
                        model: generatedResult.model,
                        rating: rating,
                    }
                }
            }
        });

        await new Promise(resolve => setTimeout(resolve, 1500));

        const googleUrl = currentSettings.googleReviewUrl || ""

        return { success: true, draft: generatedResult.text, googleUrl };
    } catch (error: unknown) {
        console.error(error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
}

async function generateGeminiReview(rating: number, businessName: string, qnaPairs: { question: string, answer: string }[], settings: any, businessSettings: any, skipAI: boolean) {
    if (skipAI) return { text: generateMockReviewOffline(rating, businessName), provider: "offline", model: "mock-offline" };

    const aiLanguage = settings?.aiLanguage || "English";
    const aiTone = settings?.aiTone || "Friendly & Natural";
    const reviewLength = settings?.reviewLength || "Medium";
    const customInstructions = settings?.additionalInstructions || "";
    const writingStyle = Array.isArray(settings?.writingStyle) && settings.writingStyle.length > 0
        ? settings.writingStyle.join(', ')
        : "Natural sounding";
    const aboutBusiness = businessSettings?.aboutBusiness || "";

    const lengthInstruction =
        reviewLength === "Short" ? "Keep it short, around 1 to 2 sentences." :
            reviewLength === "Detailed" ? "Write a detailed review, around 4 to 6 sentences." :
                "Keep it concise and natural, around 2 to 4 sentences.";

    const prompt = `
You are an expert, authentic Google Review writer. Write a Google Review for a business named "${businessName}".
${aboutBusiness ? `About this business: ${aboutBusiness}` : ''}
The customer has given this business a rating of ${rating} out of 5 stars.
Here are the customer's specific answers to questions about their experience:
${qnaPairs.map(pair => `Q: ${pair.question}\nA: ${pair.answer}`).join('\n\n')}

Guidelines:
- Write the review entirely from the perspective of the customer.
- Tone: ${aiTone}
- Style Constraints: ${writingStyle}
- Language: ${aiLanguage}
- Length: ${lengthInstruction}
${customInstructions ? `- Special Instructions: ${customInstructions}` : ''}
- VERY IMPORTANT: Do NOT include any introductory or concluding text (like "Here is a review" or "Here you go"). Output ONLY the exact text of the review.
`;

    let apiKey = process.env.GEMINI_API_KEY;
    try {
        const dbKey = await prisma.platformApiKey.findFirst({
            where: { provider: { equals: "gemini", mode: "insensitive" }, status: "active" }
        });
        if (dbKey && dbKey.key) apiKey = dbKey.key;
    } catch (e) {
        // Fallback safely if schema isn't fully propagated yet
    }

    if (!apiKey) return { text: generateMockReviewOffline(rating, businessName), provider: "offline", model: "mock-offline" };

    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await res.json();

        if (data.error) {
            console.error("Gemini API Error from Server:", data.error.message);
        }

        const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (generatedText) return { text: generatedText.trim(), provider: "google", model: "gemini-3.6-flash" };
    } catch (e) {
        console.error("Gemini API Fetch Catch:", e);
    }

    return { text: generateMockReviewOffline(rating, businessName), provider: "offline", model: "mock-offline" };
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
