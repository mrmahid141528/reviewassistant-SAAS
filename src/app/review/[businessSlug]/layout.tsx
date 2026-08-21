import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function ReviewLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ businessSlug: string }>;
}) {
    const { businessSlug } = await params;
    const business = await prisma.business.findUnique({
        where: { slug: businessSlug }
    });

    if (!business) {
        return notFound();
    }

    // Check if the Super Admin suspended this business
    if (business.status === 'suspended') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 flex-col gap-4 text-center px-4">
                <h1 className="text-3xl font-bold text-red-600">Campaign Inactive</h1>
                <p className="text-muted-foreground max-w-sm">This review campaign is currently disabled or suspended. Please contact the business owner.</p>
            </div>
        );
    }

    return <>{children}</>;
}
