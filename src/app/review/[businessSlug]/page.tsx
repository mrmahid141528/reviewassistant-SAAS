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
        select: { id: true, name: true }
    });

    if (!business) return notFound();

    const campaign = await prisma.campaign.findFirst({ where: { businessId: business.id } });
    let questions: any[] = [];

    if (campaign) {
        questions = await prisma.campaignQuestion.findMany({
            where: { campaignId: campaign.id },
            orderBy: { sortOrder: 'asc' },
            select: { id: true, question: true, questionType: true, required: true }
        });
    }

    return <ReviewClient businessName={business.name} initialQuestions={questions} />;
}
