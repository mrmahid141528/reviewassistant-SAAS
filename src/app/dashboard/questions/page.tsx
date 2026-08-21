import { QuestionsClient } from "./QuestionsClient";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export default async function QuestionsBuilderPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let savedQuestions: any[] = [];

    if (user) {
        const membership = await prisma.businessMember.findFirst({ where: { userId: user.id } });
        if (membership) {
            const campaign = await prisma.campaign.findFirst({ where: { businessId: membership.businessId } });
            if (campaign) {
                const results = await prisma.campaignQuestion.findMany({
                    where: { campaignId: campaign.id },
                    orderBy: { sortOrder: 'asc' }
                });
                savedQuestions = results.map(q => ({
                    id: q.id,
                    question: q.question,
                    type: q.questionType,
                    required: q.required
                }));
            }
        }
    }

    if (savedQuestions.length === 0) {
        savedQuestions = [
            { id: "1", question: "How was the quality of our service?", type: "Rating (1-5)", required: true },
        ];
    }

    return <QuestionsClient initialQuestions={savedQuestions} />;
}
