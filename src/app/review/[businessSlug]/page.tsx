import prisma from "@/lib/prisma";
import ReviewClient from "./ReviewClient";
import { notFound } from "next/navigation";
import { getTrialDuration } from "@/app/superadmin/pricing/actions";

export default async function CustomerReviewPage(
    props: {
        params: Promise<{ businessSlug: string }>;
        searchParams: Promise<{ [key: string]: string | undefined }>;
    }
) {
    const searchParams = await props.searchParams;
    const params = await props.params;
    const { businessSlug } = params;
    const campaignId = searchParams.campaign || null;

    const business = await prisma.business.findUnique({
        where: { slug: businessSlug },
        select: { id: true, name: true, logoUrl: true, razorpayPlanId: true, createdAt: true, settings: true }
    });

    if (!business) return notFound();

    const [plan, campaign, latestSubscription] = await Promise.all([
        business.razorpayPlanId ? prisma.plan.findUnique({ where: { id: business.razorpayPlanId } }) : Promise.resolve(null),
        campaignId ? prisma.campaign.findUnique({ where: { id: campaignId } }) : prisma.campaign.findFirst({ where: { businessId: business.id } }),
        prisma.subscription.findFirst({
            where: { businessId: business.id },
            orderBy: { currentPeriodEnd: 'desc' }
        })
    ]);

    let isExpired = false;
    let hasWatermark = false;

    // Evaluate Subscription vs Trial
    const isActiveSub = latestSubscription?.status === "active";
    let trialLimit = await getTrialDuration();
    const bSettings = business.settings as any;
    if (bSettings && typeof bSettings === 'object' && typeof bSettings.freeTrialDays === 'number') {
        trialLimit = bSettings.freeTrialDays;
    }

    const daysSinceCreated = (Date.now() - business.createdAt.getTime()) / (1000 * 60 * 60 * 24);

    if (!isActiveSub && daysSinceCreated > trialLimit) {
        isExpired = true;
    }

    if (!business.razorpayPlanId) {
        hasWatermark = true; // Trials always have watermark
    } else {
        if (plan?.limits) {
            hasWatermark = (plan.limits as Record<string, any>).hasWatermark ?? false;
        }
    }

    if (isExpired) {
        return (
            <div className="flex bg-slate-50 min-h-screen items-center justify-center p-6 font-sans">
                <div className="bg-white p-10 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-slate-100 max-w-lg w-full text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-rose-500" />

                    <div className="bg-rose-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                    </div>

                    <h1 className="text-[22px] sm:text-2xl font-black text-slate-900 mb-3 tracking-tight">Campaign Inactive</h1>
                    <p className="text-slate-500 mb-8 text-[15px] leading-relaxed font-medium">
                        This review campaign is currently paused. Please contact the business owner or manager to resolve this issue and reactivate the campaign.
                    </p>

                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        <p className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">Are you the owner?</p>
                        <p className="text-[13px] font-medium text-slate-500 mt-1">Open your dashboard to renew your subscription.</p>
                    </div>
                </div>
            </div>
        )
    }

    let questions: any[] = [];

    if (campaign) {
        questions = await prisma.campaignQuestion.findMany({
            where: { campaignId: campaign.id },
            orderBy: { sortOrder: 'asc' },
            select: { id: true, question: true, questionType: true, required: true, options: true }
        });
    }

    return <ReviewClient businessName={business.name} businessLogo={business.logoUrl} initialQuestions={questions} hasWatermark={hasWatermark} />;
}
