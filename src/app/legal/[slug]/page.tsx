import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LegalPage({ params }: { params: { slug: string } }) {
    const page = await prisma.legalPage.findUnique({
        where: { slug: params.slug }
    });

    if (!page || page.status !== 'published') {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-6">
                <Link href="/" className="inline-flex items-center text-sm font-medium text-primary hover:underline mb-8">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                </Link>

                <div className="bg-white border rounded-2xl shadow-sm p-8 md:p-12">
                    <div className="border-b pb-8 mb-8">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900">{page.title}</h1>
                        <p className="text-sm text-gray-500 mt-3">
                            Last updated: {page.updatedAt.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>

                    {/* Rendering the HTML/Text content securely from the SuperAdmin */}
                    <div
                        className="prose prose-blue max-w-none text-gray-700 space-y-4"
                        dangerouslySetInnerHTML={{ __html: page.content.replace(/\n/g, '<br/>') }}
                    />
                </div>
            </div>
        </div>
    );
}
