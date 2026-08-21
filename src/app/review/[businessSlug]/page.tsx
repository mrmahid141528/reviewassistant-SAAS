import prisma from "@/lib/prisma";
import ReviewClient from "./ReviewClient";
import { notFound } from "next/navigation";

export default async function CustomerReviewPage({
    params
}: {
    params: Promise<{ businessSlug: string }>
}) {
    const { businessSlug } = await params;

    // The layout has already checked status = suspended
    const business = await prisma.business.findUnique({
        where: { slug: businessSlug },
        select: { name: true }
    });

    if (!business) return notFound();

    return <ReviewClient businessName={business.name} />;
}
