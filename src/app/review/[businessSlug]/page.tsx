import prisma from "@/lib/prisma";
import ReviewClient from "./ReviewClient";
import { notFound } from "next/navigation";

export default async function CustomerReviewPage({
    params
}: {
    params: Promise<{ businessSlug: string }>
}) {
    const { businessSlug } = await params;

    const business = await prisma.business.findUnique({
        where: { slug: businessSlug },
        select: { id: true, name: true, razorpayPlanId: true, createdAt: true }
    });

    if (!business) return notFound();

    let isExpired = false;
    if (!business.razorpayPlanId) {
        const daysSinceCreated = (Date.now() - business.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceCreated > 7) {
            isExpired = true;
        }
    }

    if (isExpired) {
        return (
            <div className="flex bg-gray-50 min-h-screen items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full text-center">
                    <div className="text-5xl mb-4">⛔</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Campaign Paused</h1>
                    <p className="text-gray-500 mb-6 text-sm">We apologize for the inconvenience, but this business does not currently have an active subscription to accept reviews.</p>
                    <div className="border-t pt-4">
                        <p className="text-xs text-gray-400">Are you the owner? Open your dashboard to renew your services.</p>
                    </div>
                </div>
            </div>
        )
    }

    const campaign = await prisma.campaign.findFirst({ where: { businessId: business.id } });
    let questions: any[] = [];

    if (campaign) {
        questions = await prisma.campaignQuestion.findMany({
            where: { campaignId: campaign.id },
            orderBy: { sortOrder: 'asc' },
            select: { id: true, question: true, questionType: true, required: true, options: true }
        });
    }

    return <ReviewClient businessName={business.name} initialQuestions={questions} />;
}
