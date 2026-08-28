import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Star, Menu } from "lucide-react";
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from "@/components/ui/sheet";
import React from "react";

export function Header() {
    const [open, setOpen] = React.useState(false);
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

                    {/* Mobile Menu */}
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger className="md:hidden flex h-9 w-9 items-center justify-center rounded-md hover:bg-slate-100 transition-colors">
                            <Menu className="h-5 w-5" />
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[85vw] sm:w-[350px]">
                            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                            <nav className="flex flex-col gap-6 mt-8">
                                <Link onClick={() => setOpen(false)} href="/pricing" className="text-lg font-medium hover:text-primary transition-colors">
                                    Pricing
                                </Link>
                                <Link onClick={() => setOpen(false)} href="/about-us" className="text-lg font-medium hover:text-primary transition-colors">
                                    About Us
                                </Link>
                                <Link onClick={() => setOpen(false)} href="/contact-us" className="text-lg font-medium hover:text-primary transition-colors">
                                    Contact Us
                                </Link>
                                <hr className="my-2 border-border/50" />
                                <Link onClick={() => setOpen(false)} href="/login" className="text-lg font-medium hover:text-primary transition-colors">
                                    Sign In
                                </Link>
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
