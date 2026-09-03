"use client";

import { useRouter } from "next/navigation";

export function CategoryClientFilter({ categories, activeCategory }: { categories: string[], activeCategory: string }) {
    const router = useRouter();

    return (
        <div className="flex items-center gap-3">
            {categories.map(cat => (
                <button
                    key={cat}
                    onClick={() => router.push(`/dashboard/templates?category=${cat}`)}
                    className={`px-5 py-2 rounded-full font-bold text-sm tracking-wide transition-all whitespace-nowrap shrink-0 ${activeCategory === cat
                            ? "bg-slate-900 text-white shadow-md"
                            : "bg-white text-slate-500 hover:bg-slate-200 border border-slate-200"
                        }`}
                >
                    {cat}
                </button>
            ))}
        </div>
    );
}
