import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

export function Header() {
    return (
        <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
            <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-[1.02]">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Star className="h-5 w-5 text-primary fill-primary" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-foreground">
                        ReviewAssistant
                    </span>
                </Link>

                {/* Desktop Navigation Group */}
                <nav className="hidden md:flex items-center gap-8">
                    <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                        Pricing
                    </Link>
                    <Link href="/about-us" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                        About Us
                    </Link>
                    <Link href="/contact-us" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                        Contact Us
                    </Link>
                </nav>

                {/* Action Group */}
                <div className="flex items-center gap-4">
                    <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hidden sm:block">
                        Sign In
                    </Link>
                    <Link href="/login">
                        <Button size="sm" className="rounded-xl px-6 text-sm font-semibold border-transparent shadow-sm hover:scale-[1.02] transition-all">
                            Get Started
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}
