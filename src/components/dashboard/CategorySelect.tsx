"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

const CATEGORIES = [
    "Restaurant", "Cafe", "Hotel", "Salon", "Spa",
    "Retail Store", "Clothing Store", "Grocery Store",
    "Internet Cafe", "Marketing Agency", "Clinic", "Education", "Other"
];

interface CategorySelectProps {
    defaultValue?: string;
}

export default function CategorySelect({ defaultValue }: CategorySelectProps) {
    const isOther = defaultValue && !CATEGORIES.includes(defaultValue);
    const initialCategory = isOther ? "Other" : (defaultValue || "");
    const initialOthertext = isOther ? defaultValue : "";

    const [category, setCategory] = useState(initialCategory)

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-1 md:col-span-2">
            <div className="space-y-2">
                <Label htmlFor="category">Business Category *</Label>
                <select
                    suppressHydrationWarning
                    id="category"
                    name="category"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                >
                    <option value="" disabled>Select a category...</option>
                    {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            {category === "Other" && (
                <div className="space-y-2 md:col-start-2">
                    <Label htmlFor="otherCategory">Please specify category *</Label>
                    <Input
                        suppressHydrationWarning
                        id="otherCategory"
                        name="otherCategory"
                        defaultValue={initialOthertext}
                        placeholder="e.g. IT Services, Fitness Studio..."
                        required
                    />
                </div>
            )}
        </div>
    )
}
