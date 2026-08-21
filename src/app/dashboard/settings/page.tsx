import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { updateBusinessGeneral, updateGoogleConfig, updateAIPreferences } from "./actions"

export default async function SettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let businessName = "My Digital Agency"
    let websiteUrl = ""
    let email = ""
    let phone = ""
    let googleUrl = ""
    let aiLanguage = "English"
    let aiTone = "Professional & Friendly"

    if (user) {
        const membership = await prisma.businessMember.findFirst({
            where: { userId: user.id },
            include: { business: true }
        })
        if (membership?.business) {
            businessName = membership.business.name
            websiteUrl = membership.business.websiteUrl || ""
            email = membership.business.email || ""
            phone = membership.business.phone || ""

            const campaign = await prisma.campaign.findFirst({ where: { businessId: membership.businessId } })
            if (campaign?.settings) {
                const settings = campaign.settings as any
                googleUrl = settings.googleReviewUrl || ""
                aiLanguage = settings.aiLanguage || "English"
                aiTone = settings.aiTone || "Professional & Friendly"
            }
        }
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Business Profile</h2>
                <p className="text-muted-foreground">
                    Manage your business information and how customers interact with your assistant.
                </p>
            </div>

            <div className="grid gap-6">
                <Card>
                    <form action={updateBusinessGeneral}>
                        <CardHeader>
                            <CardTitle>General Information</CardTitle>
                            <CardDescription>
                                Basic details about your business that will appear on the review page.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="businessName">Business Name</Label>
                                    <Input id="businessName" name="businessName" placeholder="e.g. ABC Restaurant" defaultValue={businessName} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Input id="category" name="category" placeholder="e.g. Cafe, Gym, Salon" defaultValue="Marketing Agency" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="websiteUrl">Website URL (Optional)</Label>
                                <Input id="websiteUrl" name="websiteUrl" placeholder="https://..." defaultValue={websiteUrl} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                                    <Input id="phone" name="phone" placeholder="+91..." defaultValue={phone} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Public Email (Optional)</Label>
                                    <Input id="email" name="email" type="email" placeholder="contact@..." defaultValue={email} />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="border-t px-6 py-4">
                            <Button type="submit">Save General Info</Button>
                        </CardFooter>
                    </form>
                </Card>

                <Card>
                    <form action={updateGoogleConfig}>
                        <CardHeader>
                            <CardTitle>Google Review Configuration</CardTitle>
                            <CardDescription>
                                Provide the exact URL where customers should be redirected to leave their generated review.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="googleUrl">Google Review URL</Label>
                                <Input id="googleUrl" name="googleUrl" placeholder="https://g.page/r/.../review" defaultValue={googleUrl} />
                                <p className="text-xs text-muted-foreground mt-1">
                                    You can get this from your Google Business Profile dashboard by clicking &quot;Ask for reviews&quot;.
                                </p>
                            </div>
                        </CardContent>
                        <CardFooter className="border-t px-6 py-4">
                            <Button type="submit">Save Google Config</Button>
                        </CardFooter>
                    </form>
                </Card>

                <Card>
                    <form action={updateAIPreferences}>
                        <CardHeader>
                            <CardTitle>AI Assistant Preferences</CardTitle>
                            <CardDescription>
                                Configure the default tone and language used when generating review texts.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="language">Default Output Language</Label>
                                    <select
                                        id="language"
                                        name="language"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        defaultValue={aiLanguage}
                                    >
                                        <option>English</option>
                                        <option>Hindi</option>
                                        <option>Hinglish (Hindi written in English)</option>
                                        <option>Spanish</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tone">Default Review Tone</Label>
                                    <select
                                        id="tone"
                                        name="tone"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        defaultValue={aiTone}
                                    >
                                        <option>Professional & Friendly</option>
                                        <option>Casual & Enthusiastic</option>
                                        <option>Short & Direct</option>
                                        <option>Detailed & Story-telling</option>
                                    </select>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="border-t px-6 py-4">
                            <Button type="submit">Save AI Preferences</Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}
