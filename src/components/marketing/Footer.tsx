import Link from "next/link";
import { Star, Twitter, Github, Linkedin, Mail } from "lucide-react";
import prisma from "@/lib/prisma";

export async function Footer() {
    const legalPages = await prisma.legalPage.findMany({
        where: { status: 'published' },
        select: { slug: true, title: true }
    });

    return (
        <footer className="border-t border-border/50 bg-background pt-16 pb-8 relative z-10 w-full overflow-hidden">
            {/* Decorative Blur */}
            <div className="absolute bottom-0 right-0 w-[40%] h-[150%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16 relative z-10">

                    {/* Column 1: Brand */}
                    <div className="flex flex-col gap-4">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Star className="h-5 w-5 text-primary fill-primary" />
                            </div>
                            <span className="text-xl font-bold tracking-tight">ReviewAssistant</span>
                        </Link>
                        <p className="text-muted-foreground text-sm leading-relaxed mt-2 max-w-sm">
                            Automating 5-star Google reputation for local businesses using frictionless QR AI workflows. Stop begging for reviews.
                        </p>
                        <div className="flex items-center gap-4 mt-4">
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Twitter className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Github className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Linkedin className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div className="flex flex-col gap-4">
                        <h3 className="font-semibold text-foreground tracking-tight">Products & Company</h3>
                        <div className="flex flex-col gap-3">
                            <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Home</Link>
                            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">Pricing & Plans</Link>
                            <Link href="/about-us" className="text-sm text-muted-foreground hover:text-primary transition-colors">About Us</Link>
                            <Link href="/contact-us" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact Support</Link>
                        </div>
                    </div>

                    {/* Column 3: Legal (Dynamic) */}
                    <div className="flex flex-col gap-4">
                        <h3 className="font-semibold text-foreground tracking-tight">Legal & Compliance</h3>
                        <div className="flex flex-col gap-3">
                            {legalPages.length > 0 ? (
                                legalPages.map(page => (
                                    <Link
                                        key={page.slug}
                                        href={`/legal/${page.slug}`}
                                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        {page.title}
                                    </Link>
                                ))
                            ) : (
                                <span className="text-sm text-muted-foreground italic">No legal pages configured.</span>
                            )}
                        </div>
                    </div>

                    {/* Column 4: Contact Drop */}
                    <div className="flex flex-col gap-4">
                        <h3 className="font-semibold text-foreground tracking-tight">Get in Touch</h3>
                        <p className="text-sm text-muted-foreground">
                            Questions or need custom enterprise pricing? We'll map it out.
                        </p>
                        <a href="mailto:support@reviewassistant.com" className="inline-flex items-center gap-2 mt-2 text-sm font-medium text-primary hover:underline underline-offset-4">
                            <Mail className="h-4 w-4" /> support@reviewassistant.com
                        </a>
                    </div>

                </div>

                {/* Bottom Banner */}
                <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} Google Review Assistant SaaS. All rights reserved.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                            All Systems Operational
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
