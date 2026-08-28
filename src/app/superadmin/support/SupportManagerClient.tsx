"use client"

import { useState } from "react"
import { createFaqArticle, deleteFaqArticle, updatePlatformContact } from "./actions"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SubmitButton } from "@/components/ui/submit-button"
import { ActionForm } from "@/components/ui/action-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, FileText, Phone, Mail, Globe } from "lucide-react"

export default function SupportManagerClient({ initialArticles, initialContact }: { initialArticles: any[], initialContact: { email: string, whatsapp: string } }) {
    const [openAdd, setOpenAdd] = useState(false);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this article?")) return;
        try {
            await deleteFaqArticle(id);
        } catch (e: any) {
            alert(e.message);
        }
    }

    return (
        <div className="space-y-8 max-w-6xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Support & Knowledge Base</h1>
                <p className="text-muted-foreground mt-2 text-base">
                    Manage FAQs, help articles, and global contact information for all platform tenants.
                </p>
            </div>

            <Tabs defaultValue="articles" className="w-full">
                <TabsList className="mb-6 h-12">
                    <TabsTrigger value="articles" className="h-full px-6 gap-2"><FileText className="h-4 w-4" /> Articles</TabsTrigger>
                    <TabsTrigger value="contact" className="h-full px-6 gap-2"><Phone className="h-4 w-4" /> Contact Info</TabsTrigger>
                </TabsList>

                {/* 1. ARTICLES TAB */}
                <TabsContent value="articles" className="space-y-6">
                    <div className="flex justify-between items-center bg-card p-6 border rounded-xl shadow-sm">
                        <div>
                            <h3 className="font-bold text-lg">Published Articles</h3>
                            <p className="text-muted-foreground text-sm">These articles are visible to all business owners.</p>
                        </div>
                        <Dialog open={openAdd} onOpenChange={setOpenAdd}>
                            <DialogTrigger render={<Button className="gap-2" />}>
                                <Plus className="h-4 w-4" /> Add Article / FAQ
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[700px]">
                                <DialogHeader>
                                    <DialogTitle>Create New Help Article</DialogTitle>
                                </DialogHeader>
                                <ActionForm action={async (formData: FormData) => { await createFaqArticle(formData); setOpenAdd(false); }}>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Article Title *</Label>
                                            <Input name="title" required placeholder="e.g. How to print your QR Code" className="h-12" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Category</Label>
                                                <select name="category" className="flex h-12 w-full rounded-md border border-input bg-card px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50">
                                                    <option value="getting-started">Getting Started</option>
                                                    <option value="qr-links">QR & Links</option>
                                                    <option value="billing">Billing</option>
                                                    <option value="general">General Help</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Status</Label>
                                                <select name="status" className="flex h-12 w-full rounded-md border border-input bg-card px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50">
                                                    <option value="published">Published</option>
                                                    <option value="draft">Draft</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-2 pt-2">
                                            <Label>Content (Markdown Supported) *</Label>
                                            <Textarea name="content" required placeholder="Write your tutorial or fix here..." className="min-h-[250px] resize-y" />
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-4 border-t">
                                        <SubmitButton>Publish Article</SubmitButton>
                                    </div>
                                </ActionForm>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="space-y-3">
                        {initialArticles.length > 0 ? initialArticles.map(article => (
                            <div key={article.id} className="flex justify-between items-start p-6 bg-card border rounded-xl hover:border-primary/50 transition-colors">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-bold text-lg">{article.title}</h3>
                                        <Badge variant="outline" className={article.status === 'published' ? 'text-green-600 bg-green-50' : 'text-amber-600 bg-amber-50'}>
                                            {article.status}
                                        </Badge>
                                        <Badge variant="secondary">{article.category}</Badge>
                                    </div>
                                    <p className="text-muted-foreground text-sm line-clamp-2 mt-2">{article.content}</p>
                                </div>
                                <Button variant="ghost" className="text-destructive hover:bg-destructive/10 shrink-0" onClick={() => handleDelete(article.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        )) : (
                            <div className="text-center py-16 bg-muted/30 border rounded-xl">
                                <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                                <p className="font-semibold text-lg">No articles found</p>
                                <p className="text-muted-foreground text-sm">Create your first help article to populate the knowledge base.</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* 2. CONTACT TAB */}
                <TabsContent value="contact">
                    <Card>
                        <CardHeader>
                            <CardTitle>Global Support Contact</CardTitle>
                            <CardDescription>
                                This information will be displayed on the Help & Support page for all business owners.
                            </CardDescription>
                        </CardHeader>
                        <ActionForm action={updatePlatformContact}>
                            <CardContent className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2"><Phone className="h-4 w-4" /> WhatsApp Support Number</Label>
                                        <Input name="whatsapp" defaultValue={initialContact.whatsapp} placeholder="+91 0000000000" className="h-12 text-lg" required />
                                        <p className="text-xs text-muted-foreground">Include country code for direct chat links.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2"><Mail className="h-4 w-4" /> Support Email Address</Label>
                                        <Input name="email" defaultValue={initialContact.email} placeholder="support@yourdomain.com" type="email" className="h-12 text-lg" required />
                                        <p className="text-xs text-muted-foreground">Primary email checked by the support team.</p>
                                    </div>
                                </div>
                            </CardContent>
                            <div className="p-6 border-t bg-muted/10 flex justify-end">
                                <SubmitButton>Save Global Settings</SubmitButton>
                            </div>
                        </ActionForm>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
