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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, ChevronRight, MessageSquare, Mail, TerminalSquare, Smartphone, HelpCircle, BarChart3, FileText } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from 'react-markdown';

export function SupportClient({ articles, contact }: { articles: any[], contact: { email: string, whatsapp: string } }) {
    const [search, setSearch] = useState("");

    const filteredArticles = articles.filter(a => a.title.toLowerCase().includes(search.toLowerCase()) || a.category.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-8 max-w-5xl pb-10">
            {/* Header */}
            <div className="bg-primary/5 p-8 -mx-4 sm:-mx-8 -mt-4 sm:-mt-8 rounded-b-3xl border-b mb-8 flex flex-col items-center text-center space-y-4">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">How can we help?</h1>
                <p className="text-muted-foreground text-lg max-w-lg">
                    Find answers in our Knowledge Base or contact our support team.
                </p>
                <div className="relative w-full max-w-md mt-4">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search for articles..."
                        className="pl-10 h-12 bg-background border-primary/20 shadow-sm rounded-xl text-base"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Quick Help Cards */}
            {!search && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div onClick={() => setSearch("getting-started")}>
                        <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
                            <CardHeader className="pb-3">
                                <TerminalSquare className="h-6 w-6 text-primary mb-2" />
                                <CardTitle className="text-lg">Getting Started</CardTitle>
                                <CardDescription>Learn how to set up your business and start collecting reviews.</CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                    <div onClick={() => setSearch("qr-links")}>
                        <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
                            <CardHeader className="pb-3">
                                <Smartphone className="h-6 w-6 text-emerald-500 mb-2" />
                                <CardTitle className="text-lg">QR & Links</CardTitle>
                                <CardDescription>Create, download and share your review QR code.</CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">
                {/* Dynamically Fetched Articles */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-bold tracking-tight mb-4">
                        {search ? "Search Results" : "Frequently Asked Questions & Articles"}
                    </h2>

                    {filteredArticles.length > 0 ? (
                        <div className="space-y-3">
                            {filteredArticles.map((article) => (
                                <Dialog key={article.id}>
                                    <DialogTrigger render={<div className="flex justify-between items-center p-5 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer group" />}>
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-5 w-5 text-primary/70" />
                                            <span className="font-medium text-base group-hover:text-primary transition-colors">{article.title}</span>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle className="text-2xl pt-2 pb-4 border-b">{article.title}</DialogTitle>
                                        </DialogHeader>
                                        <div className="prose prose-slate dark:prose-invert max-w-none pt-4">
                                            <ReactMarkdown>{article.content}</ReactMarkdown>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center p-8 border rounded-lg bg-card">
                            <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                            <h3 className="font-medium text-lg">No articles found</h3>
                            <p className="text-muted-foreground">Try adjusting your search terms.</p>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    {/* Still need help? Fetching Real DB Contact Data */}
                    <Card className="border-primary/20 bg-primary/5">
                        <CardHeader>
                            <CardTitle className="text-lg">Still need help?</CardTitle>
                            <CardDescription>Our team is available over email or WhatsApp to resolve any issues.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button
                                className="w-full justify-start gap-2 bg-[#25D366] hover:bg-[#20b958] text-white border-none shadow-sm h-12"
                                onClick={() => window.open(`https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`, '_blank')}
                            >
                                <MessageSquare className="h-5 w-5" /> WhatsApp Support
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start gap-2 bg-white hover:bg-slate-50 h-12"
                                onClick={() => window.location.href = `mailto:${contact.email}`}
                            >
                                <Mail className="h-5 w-5" /> Email Support
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
