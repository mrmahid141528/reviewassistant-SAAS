"use client"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronRight, MessageSquare, Mail, TerminalSquare, Smartphone, HelpCircle, BarChart3, CheckCircle2 } from "lucide-react";

export default function SupportPage() {
    return (
        <div className="space-y-8 max-w-5xl pb-10">
            {/* Header */}
            <div className="bg-primary/5 p-8 -mx-4 sm:-mx-8 -mt-4 sm:-mt-8 rounded-b-3xl border-b mb-8 flex flex-col items-center text-center space-y-4">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">How can we help?</h1>
                <p className="text-muted-foreground text-lg max-w-lg">
                    Find answers, learn how to use Review Assistant, or contact our support team.
                </p>
                <div className="relative w-full max-w-md mt-4">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search &quot;How to create a QR code?&quot;"
                        className="pl-10 h-12 bg-background border-primary/20 shadow-sm rounded-xl text-base"
                    />
                </div>
            </div>

            {/* Quick Help Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
                    <CardHeader className="pb-3">
                        <TerminalSquare className="h-6 w-6 text-primary mb-2" />
                        <CardTitle className="text-lg">Getting Started</CardTitle>
                        <CardDescription>Learn how to set up your business and start collecting reviews.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center text-sm font-semibold text-primary group-hover:translate-x-1 transition-transform">
                            View Guide <ChevronRight className="h-4 w-4 ml-1" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
                    <CardHeader className="pb-3">
                        <Smartphone className="h-6 w-6 text-emerald-500 mb-2" />
                        <CardTitle className="text-lg">QR & Review Links</CardTitle>
                        <CardDescription>Create, download and share your review QR code.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center text-sm font-semibold text-primary group-hover:translate-x-1 transition-transform">
                            Learn More <ChevronRight className="h-4 w-4 ml-1" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
                    <CardHeader className="pb-3">
                        <HelpCircle className="h-6 w-6 text-indigo-500 mb-2" />
                        <CardTitle className="text-lg">Review Questions</CardTitle>
                        <CardDescription>Customize the questions your customers answer.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center text-sm font-semibold text-primary group-hover:translate-x-1 transition-transform">
                            Learn More <ChevronRight className="h-4 w-4 ml-1" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
                    <CardHeader className="pb-3">
                        <BarChart3 className="h-6 w-6 text-orange-500 mb-2" />
                        <CardTitle className="text-lg">Analytics</CardTitle>
                        <CardDescription>Understand scans, sessions and review performance.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center text-sm font-semibold text-primary group-hover:translate-x-1 transition-transform">
                            Learn More <ChevronRight className="h-4 w-4 ml-1" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">
                {/* Frequently Asked Questions */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-bold tracking-tight mb-4">Frequently Asked Questions</h2>
                    <div className="space-y-2">
                        {[
                            "How does Review Assistant work?",
                            "How do I create a QR code?",
                            "How do I connect Google Reviews?",
                            "How can I change my questions?",
                            "Can I have multiple business locations?",
                            "Where can I see customer feedback?"
                        ].map((q, i) => (
                            <div key={i} className="flex justify-between items-center p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer">
                                <span className="font-medium text-sm">{q}</span>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Still need help? */}
                    <Card className="border-primary/20 bg-primary/5">
                        <CardHeader>
                            <CardTitle className="text-lg">Still need help?</CardTitle>
                            <CardDescription>Our team is available over email or WhatsApp to resolve any issues.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button className="w-full justify-start gap-2 bg-[#25D366] hover:bg-[#20b958] text-white border-none" onClick={() => window.open('https://wa.me/91000000000', '_blank')}>
                                <MessageSquare className="h-4 w-4" /> WhatsApp Support
                            </Button>
                            <Button variant="outline" className="w-full justify-start gap-2 bg-white" onClick={() => window.location.href = 'mailto:support@example.com'}>
                                <Mail className="h-4 w-4" /> Email Support
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
