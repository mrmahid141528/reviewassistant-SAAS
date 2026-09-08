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

        let googleUrl = currentSettings.googleReviewUrl || (business.settings as any)?.googleReviewUrl || "";

        // Use Campaign's linked Location Review Link if available
        if (!googleUrl && campaign.location?.reviewLink) {
            googleUrl = campaign.location.reviewLink;
        } else if (!googleUrl) {
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

        return { success: true, draft: generatedResult.text, drafts: [generatedResult.text], googleUrl };
    } catch (error: unknown) {
        console.error(error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
}

async function generateGeminiReview(rating: number, businessName: string, qnaPairs: { question: string, answer: string }[], settings: any, businessSettings: any, skipAI: boolean) {
    if (skipAI) return { text: generateMockReviewOffline(rating, businessName), provider: "offline", model: "mock-offline" };

    const aiLanguage = settings?.aiLanguage || "Auto-detect";
    const aiTone = settings?.aiTone || "Friendly & Natural";
    const targetLength = settings?.reviewLength || "Medium";
    const writingStyle = settings?.writingStyle || [];
    const additionalInstructions = settings?.additionalInstructions || "";
    const aboutBusiness = businessSettings?.aboutBusiness || "";

    let lengthInstruction = "";
    if (targetLength === "Short") lengthInstruction = "Keep it extremely concise (1 to 2 short sentences).";
    else if (targetLength === "Long") lengthInstruction = "Write a highly detailed and comprehensive review (3+ sentences).";
    else lengthInstruction = "Keep it natural and balanced (around 2 to 3 sentences).";

    const prompt = `
You are a customer-experience writing assistant. Your job is to transform the customer's mapped experience into a natural-sounding Google review.

Business Name: "${businessName}"
${aboutBusiness ? `About this business: ${aboutBusiness}` : ''}
Customer Rating: ${rating} out of 5 stars

Settings from Business Owner:
- Tone: ${aiTone}
${writingStyle.length > 0 ? `- Writing Style constraints: ${writingStyle.join(", ")}` : ''}
${additionalInstructions ? `- Target Instructions: ${additionalInstructions}` : ''}

Customer Input / Experience Details:
${qnaPairs.length > 0 ? qnaPairs.map(pair => `- Aspect: ${pair.question}\n  Customer's Experience/Answer: ${pair.answer}`).join('\n') : "No detailed feedback provided. The customer ONLY left a star rating."}

CRITICAL INSTRUCTIONS (MUST FOLLOW STRICTLY):
1. **NO HALLUCINATION**: Use ONLY the information provided in the Customer Input. If the Customer Input says "No detailed feedback provided", you MUST generate a realistic, generic review that perfectly aligns with the star rating without inventing specific products, services, staff names, or events. If input IS provided, stick entirely to it.
2. **NO EXAGGERATION**: Do not manufacture praise or exaggerate.
3. **PRESERVE TRUE SENTIMENT**: Accurately reflect the customer's true sentiment (positive, neutral, or negative) based solely on their input. Do not force it to be overly positive.
4. **STYLE & TONE**: Apply the Tone and Writing Style constraints provided by the business owner above. However, the review must still sound like a natural expression from a real customer.
5. **YOUR FORMAT**: Output ONLY the raw text requested without quotes or introductory conversational text.
6. **LANGUAGE**: ${aiLanguage === "Auto-detect" ? "Write the review in the same language that the customer used in their input. If no input is provided, default to the language of the business name." : `Write the review STRICTLY in ${aiLanguage}.`}
7. **LENGTH**: ${lengthInstruction}
`;

    let apiKey = process.env.GEMINI_API_KEY;
    let dbKeyRecord: any = null;

    try {
        dbKeyRecord = await prisma.platformApiKey.findFirst({
            where: { provider: { equals: "gemini", mode: "insensitive" }, status: "active" }
        });
        if (dbKeyRecord && dbKeyRecord.key) apiKey = dbKeyRecord.key;
    } catch (e) {
        // Fallback safely if schema isn't fully propagated yet
    }

    if (!apiKey) return { text: generateMockReviewOffline(rating, businessName), provider: "offline", model: "mock-offline" };

    const startTime = Date.now();
    let apiStatus = "FAILED";
    let errorMsg = "NONE";
    let tokensUsed = 0;
    const modelUsed = "gemini-3.6-flash";

    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelUsed}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const duration = Date.now() - startTime;

        const data = await res.json();

        if (data.error) {
            console.error("Gemini API Error from Server:", data.error.message);
            errorMsg = data.error.message || "Unknown API Error";
        } else {
            const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            if (generatedText) {
                apiStatus = "SUCCESS";
                tokensUsed = data?.usageMetadata?.totalTokenCount || 0;

                if (dbKeyRecord) {
                    await prisma.platformApiKey.update({
                        where: { id: dbKeyRecord.id },
                        data: {
                            lastUsedAt: new Date(),
                            lastResponseMs: duration,
                            lastStatus: apiStatus,
                            lastTokens: tokensUsed,
                            lastModel: modelUsed,
                            lastError: "NONE"
                        }
                    }).catch(console.error); // Do not block generation if telemetry fails
                }
                return { text: generatedText, provider: "google", model: modelUsed };
            }
        }

        // Log Failure
        if (dbKeyRecord) {
            await prisma.platformApiKey.update({
                where: { id: dbKeyRecord.id },
                data: {
                    lastUsedAt: new Date(),
                    lastResponseMs: duration,
                    lastStatus: apiStatus,
                    lastError: errorMsg
                }
            }).catch(console.error);
        }
    } catch (e: any) {
        console.error("Gemini API Fetch Catch:", e);
        if (dbKeyRecord) {
            await prisma.platformApiKey.update({
                where: { id: dbKeyRecord.id },
                data: {
                    lastUsedAt: new Date(),
                    lastResponseMs: Date.now() - startTime,
                    lastStatus: "EXCEPTION",
                    lastError: e.message || "Network/Fetch Error"
                }
            }).catch(console.error);
        }
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
