import prisma from "@/lib/prisma";
import Link from "next/link";
import { LayoutTemplate, ChevronRight, Grid2X2 } from "lucide-react";
import { CategoryClientFilter } from "./TemplateClientFilter"; // Component for client side filter buttons

export default async function DashboardTemplatesPage({ searchParams }: { searchParams: { category?: string } }) {
    const activeCategory = searchParams.category || "All";

    const templates = await prisma.designTemplate.findMany({
        where: activeCategory !== "All" ? { category: activeCategory } : undefined,
        orderBy: { createdAt: "desc" }
    });

    // Extract all unique categories to populate the tabs dynamically, prioritizing the requested ones
    const allDbCategories = await prisma.designTemplate.groupBy({
        by: ['category'],
    });

    // The user requested: All, Restaurant, Cafe, Hotel, Salon first.
    const priorityCategories = ["All", "Restaurant", "Cafe", "Hotel", "Salon"];
    const dbCategories = allDbCategories.map((c: any) => c.category).filter((c: any) => c !== "All");
    const uniqueCategories = Array.from(new Set([...priorityCategories, ...dbCategories]));

    return (
        <div className="flex-1 w-full flex flex-col min-h-screen bg-slate-50/50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-8 py-10 shadow-sm z-10 shrink-0">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <LayoutTemplate className="w-8 h-8 text-blue-600" />
                            Flyer Marketplace
                        </h1>
                        <p className="text-slate-500 mt-2 font-medium">Explore and order premium physical table-tents and review flyers.</p>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="w-full h-full max-w-7xl mx-auto px-8 py-8 flex flex-col flex-1 pb-24">

                {/* Horizontal Category Bar */}
                <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
                    <CategoryClientFilter categories={uniqueCategories} activeCategory={activeCategory} />
                </div>

                {/* Templates Grid */}
                {templates.length === 0 ? (
                    <div className="flex-1 w-full bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center p-12 text-center h-[500px]">
                        <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
                            <Grid2X2 className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">No Templates Found</h3>
                        <p className="text-slate-500 font-medium max-w-sm mb-6 leading-relaxed">
                            We haven't uploaded any templates in the <strong>{activeCategory}</strong> category yet. Check back soon!
                        </p>
                        {activeCategory !== "All" && (
                            <Link href="/dashboard/templates" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-lg transition-colors">
                                Browse All Categories
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {templates.map((tpl: any) => (
                            <div key={tpl.id} className="group bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-[0px_20px_40px_-10px_rgba(0,0,0,0.1)] transition-all duration-300 overflow-hidden relative flex flex-col p-3 hover:-translate-y-1">
                                <div className="w-full flex-1 aspect-[1/1.3] relative overflow-hidden bg-slate-50 rounded-xl mb-3 flex items-center justify-center">
                                    <img src={tpl.imageUrl} alt={tpl.name} className="max-w-[400px] max-h-[500px] w-full h-full object-contain p-4 transition-transform duration-700 ease-out group-hover:scale-105" />
                                </div>
                                <div className="px-1 pb-1">
                                    <h3 className="font-bold text-slate-900 text-[16px] mb-1 truncate pr-4">{tpl.name}</h3>
                                    <p className="text-[12px] font-semibold text-blue-600 mb-4">{tpl.category}</p>
                                    <Link
                                        href={`/dashboard/templates/${tpl.id}/customize`}
                                        className="w-full flex items-center justify-between px-4 py-3 bg-slate-900 hover:bg-black text-white font-bold rounded-xl transition-colors group/btn"
                                    >
                                        Customize Yours
                                        <ChevronRight className="w-4 h-4 opacity-50 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
