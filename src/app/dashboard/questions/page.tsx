import { QuestionsClient } from "./QuestionsClient";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export default async function QuestionsBuilderPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const searchParams = await props.searchParams;
    const locationIdFilter = searchParams?.locationId as string | undefined;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let savedQuestions: any[] = [];
    let businessName = "Your Business";
    let locations: { id: string, name: string }[] = [];

    if (user) {
        const membership = await prisma.businessMember.findFirst({ where: { userId: user.id }, include: { business: true } });
        if (membership) {
            businessName = membership.business.name || businessName;

            locations = await prisma.businessLocation.findMany({
                where: { businessId: membership.businessId },
                select: { id: true, name: true }
            })

            const queryContext: any = { businessId: membership.businessId }
            if (locationIdFilter && locationIdFilter !== 'all') {
                queryContext.locationId = locationIdFilter;
            }

            const campaign = await prisma.campaign.findFirst({
                where: queryContext,
                orderBy: { createdAt: 'desc' }
            });

            if (campaign) {
                const results = await prisma.campaignQuestion.findMany({
                    where: { campaignId: campaign.id },
                    orderBy: { sortOrder: 'asc' }
                });
                savedQuestions = results.map(q => ({
                    id: q.id,
                    question: q.question,
                    type: q.questionType,
                    options: q.options,
                    required: q.required
                }));
            }
        }
    }

    return <QuestionsClient
        initialQuestions={savedQuestions}
        businessName={businessName}
        locations={locations}
        currentLocationId={locationIdFilter || 'all'}
    />;
}
