'use server'

import prisma from "@/lib/prisma"
import { getTrialDuration } from "@/app/superadmin/pricing/actions"

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
            let trialLimit = await getTrialDuration();
            const bSettings = business.settings as any;
            if (bSettings && typeof bSettings === 'object' && typeof bSettings.freeTrialDays === 'number') {
                trialLimit = bSettings.freeTrialDays;
            }

            const daysSinceCreated = (Date.now() - business.createdAt.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceCreated > trialLimit) {
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
        let campaign = await prisma.campaign.findFirst({
            where: { businessId: business.id },
            include: { location: true }
        });

        if (!campaign) {
            campaign = await prisma.campaign.create({
                data: {
                    businessId: business.id,
                    name: "Review Campaign",
                    slug: "main-campaign"
                },
                include: { location: true }
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

        let googleUrl = currentSettings.googleReviewUrl || "";

        // Use Campaign's linked Location Review Link if available
        if (campaign.location?.reviewLink) {
            googleUrl = campaign.location.reviewLink;
        } else {
            // Fallback 1: Main Location
            const mainLoc = await prisma.businessLocation.findFirst({
                where: { businessId: business.id, isMain: true }
            });
            if (mainLoc?.reviewLink) {
                googleUrl = mainLoc.reviewLink;
            } else {
                // Fallback 2: Any location with a review link
                const anyLoc = await prisma.businessLocation.findFirst({
                    where: { businessId: business.id, reviewLink: { not: null } }
                });
                if (anyLoc?.reviewLink) {
                    googleUrl = anyLoc.reviewLink;
                }
            }
        }

        let drafts = [generatedResult.text];
        if (generatedResult.text && generatedResult.text.includes('|||')) {
            drafts = generatedResult.text.split('|||').map((t: string) => t.trim()).filter(Boolean);
        }

        return { success: true, draft: generatedResult.text, drafts, googleUrl };
    } catch (error: unknown) {
        console.error(error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
}

async function generateGeminiReview(rating: number, businessName: string, qnaPairs: { question: string, answer: string }[], settings: any, businessSettings: any, skipAI: boolean) {
    if (skipAI) return { text: generateMockReviewOffline(rating, businessName), provider: "offline", model: "mock-offline" };

    const aiLanguage = settings?.aiLanguage || "None";
    const aboutBusiness = businessSettings?.aboutBusiness || "";

    const extraLanguage = (aiLanguage && aiLanguage !== "None" && aiLanguage !== "Auto-detect") ? aiLanguage : null;

    // Dynamically decide the target length based on strictly the input volume
    const totalInputWords = qnaPairs.reduce((acc, pair) => acc + (pair.answer.match(/\S+/g)?.length || 0), 0);
    const lengthInstruction = totalInputWords < 5
        ? "Keep it extremely concise (1 or 2 very short sentences) matching their minimal input."
        : totalInputWords < 20
            ? "Keep it natural and concise (around 2 sentences)."
            : "Write a complete review naturally reflecting their detailed input, but do not invent extra details.";

    const prompt = `
You are a customer-experience writing assistant. Your job is to transform the customer's mapped experience into a natural-sounding Google review.

Business Name: "${businessName}"
${aboutBusiness ? `About this business: ${aboutBusiness}` : ''}
Customer Rating: ${rating} out of 5 stars

Customer Input / Experience Details:
${qnaPairs.map(pair => `- Aspect: ${pair.question}\n  Customer's Experience/Answer: ${pair.answer}`).join('\n')}

CRITICAL INSTRUCTIONS (MUST FOLLOW STRICTLY):
1. **NO HALLUCINATION**: Use ONLY the information provided by the customer in their answers. Never invent products, services, staff names, prices, locations, emotions, or specific events.
2. **NO EXAGGERATION**: Do not manufacture praise or exaggerate. If the customer wrote 3 words, write a short review based ONLY on those 3 words.
3. **PRESERVE TRUE SENTIMENT**: Accurately reflect the customer's true sentiment (positive, neutral, or negative) based solely on their input. Do not force it to be overly positive.
4. **NATURAL TONE**: The review must sound like a natural expression of a regular customer. Do not polish it so much that it sounds like perfectly grammatical marketing copy.
5. **AVOID CLICHÉS**: Do not use generic AI phrases like "highly recommend", "truly outstanding", "must-visit", "exceeded expectations", or "top-notch" UNLESS the customer specifically used those exact words.
6. **YOUR FORMAT**: Output ONLY the raw text requested without quotes or introductory conversational text.
7. **LANGUAGE**: ${extraLanguage ? `Provide EXACTLY 3 versions of the same review separated by '|||'. Use this exact layout:
English:
[English text here]
|||
${extraLanguage}:
[Native script text here]
|||
${extraLanguage} (Roman Script):
[Romanized text here]` : `Write the review in English.`}
8. **DYNAMIC LENGTH**: ${lengthInstruction}
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

    let attempts = 0;
    while (attempts < 2) {
        attempts++;
        try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            const data = await res.json();

            if (data.error) {
                console.error("Gemini API Error from Server:", data.error.message);
                break; // Exit loop on actual API failure
            }

            const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

            if (generatedText) {
                // Validation Step
                const isValid = await validateReviewAuthenticity(generatedText, qnaPairs, apiKey);
                if (isValid || attempts === 2) {
                    return { text: generatedText, provider: "google", model: "gemini-3.6-flash" };
                }
                console.log(`Review Validation failed on attempt ${attempts}. Regenerating...`);
            }
        } catch (e) {
            console.error("Gemini API Fetch Catch:", e);
            break;
        }
    }

    return { text: generateMockReviewOffline(rating, businessName), provider: "offline", model: "mock-offline" };
}

async function validateReviewAuthenticity(generatedText: string, qnaPairs: { question: string, answer: string }[], apiKey: string): Promise<boolean> {
    const prompt = `
You are a strict data validation bot. Analyze this Review Draft based strictly on the Customer Input.

Customer Input:
${qnaPairs.map(p => `- Aspect: ${p.question} | Answer: ${p.answer}`).join('\n')}

Review Draft: "${generatedText}"

Task: Reply with exactly "PASS" or "FAIL".
Rules to FAIL:
1. The draft mentions specific facts, items, names, or services NOT mentioned in the Customer Input.
2. The draft sounds overly promotional using clichés (e.g., "highly recommend", "top-notch") not present in the input.
3. The draft is substantially longer or exaggerates the experience beyond what the customer provided.
Otherwise, reply with "PASS".
`;
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await res.json();
        const result = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        return result === "PASS";
    } catch (e) {
        return true; // fail-open if validation API fails
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
