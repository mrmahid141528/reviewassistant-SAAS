import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

export function Header() {
    return (
        <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
            <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Star className="h-5 w-5 text-primary fill-primary" />
                    </div>
                    <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
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
                        <Button size="sm" className="rounded-full px-6 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all">
                            Get Started
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}
