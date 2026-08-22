import prisma from "@/lib/prisma";
import Link from "next/link";
import { Check, Star, Building2, Globe, Rocket } from "lucide-react";

const getIcon = (slug: string) => {
    if (slug === 'starter') return Star;
    if (slug === 'growth') return Rocket;
    if (slug === 'enterprise') return Building2;
    return Globe; // Default for business
}

const getIconClass = (slug: string) => {
    if (slug === 'starter') return "bg-gray-100 text-gray-600";
    if (slug === 'growth') return "bg-blue-100 text-blue-600";
    if (slug === 'enterprise') return "bg-slate-100 text-slate-600";
    return "bg-indigo-100 text-indigo-600";
}

export default async function PublicPricingPage() {
    const plans = await prisma.plan.findMany({
        where: { status: 'active' },
        orderBy: { priceMonthly: 'asc' }
    });

    return (
        <div className="min-h-screen bg-background font-sans pt-24 pb-20">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Simple, transparent pricing</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Whether you are a single local business or a massive franchise network, we have a plan designed specifically to boost your Google visibility.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                    {plans.length === 0 && (
                        <div className="col-span-4 text-center py-12 text-gray-500 bg-card border rounded-xl">
                            Loading pricing configurations...
                        </div>
                    )}

                    {plans.map((plan) => {
                        const isPopular = plan.slug === 'growth'; // Typically middle-tier
                        const isContactOnly = (plan.limits as any)?.customPlan === true;
                        const Icon = getIcon(plan.slug);
                        const iconClass = getIconClass(plan.slug);

                        return (
                            <div key={plan.id} className={`relative flex flex-col bg-card border rounded-2xl shadow-sm overflow-hidden transition-all hover:shadow-md hover:scale-[1.01] ${isPopular ? 'ring-2 ring-primary' : 'ring-1 ring-border'}`}>
                                {isPopular && (
                                    <div className="absolute top-0 inset-x-0 flex justify-center">
                                        <span className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-b-lg">
                                            Most Popular
                                        </span>
                                    </div>
                                )}
                                <div className="p-6 pt-10 flex-1 flex flex-col">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`p-2 rounded-lg ${iconClass}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-lg font-bold">{plan.name}</h3>
                                    </div>
                                    <p className="text-muted-foreground text-sm mb-6 h-10">{plan.description}</p>

                                    <div className="mb-6">
                                        <span className="text-3xl font-bold">
                                            {isContactOnly ? "Custom" : `₹${Number(plan.priceMonthly)}`}
                                        </span>
                                        {!isContactOnly && <span className="text-muted-foreground">/mo</span>}
                                    </div>

                                    <ul className="space-y-3 mb-8 flex-1">
                                        {(plan.features as string[])?.map((feature: string, idx: number) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm text-foreground/80">
                                                <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <Link href={isContactOnly ? "mailto:sales@example.com" : "/login"}>
                                        <button
                                            className={`w-full py-2.5 rounded-lg font-medium text-sm transition-colors ${isContactOnly
                                                    ? 'bg-muted text-foreground border hover:bg-muted/80'
                                                    : isPopular
                                                        ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
                                                        : 'bg-background text-primary border border-primary/20 hover:bg-primary/5'
                                                }`}
                                        >
                                            {isContactOnly ? "Contact Sales" : "Start 7-Day Free Trial"}
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}
