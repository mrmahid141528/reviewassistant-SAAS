import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { SubmitButton } from "@/components/ui/submit-button";
import { ActionForm } from "@/components/ui/action-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"
import LogoUpload from "@/components/dashboard/LogoUpload";

import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { updateBusinessGeneral } from "../actions"

export const dynamic = "force-dynamic";

export default async function BusinessSettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let businessName = "My Business"
    let websiteUrl = ""
    let email = ""
    let phone = ""
    let category = ""
    let description = ""
    let logoUrl: string | null = null;

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
            category = membership.business.category || ""

            const settings = membership.business.settings as any;
            if (settings && settings.description) {
                description = settings.description;
            }
            logoUrl = membership.business.logoUrl;
        }
    }

    const CAETGORIES = [
        "Restaurant", "Cafe", "Hotel", "Salon", "Spa",
        "Retail Store", "Clothing Store", "Grocery Store",
        "Internet Cafe", "Marketing Agency", "Clinic", "Education", "Other"
    ];

    const isOtherCategory = category && !CAETGORIES.includes(category);
    const displayCategory = isOtherCategory ? "Other" : category;

    return (
        <Card>
            <ActionForm action={updateBusinessGeneral}>
                <CardHeader>
                    <CardTitle>Business Information</CardTitle>
                    <CardDescription>
                        Manage your primary business identity.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Logo Section */}
                    <div className="space-y-2">
                        <Label>Business Logo</Label>
                        <LogoUpload currentLogoUrl={logoUrl} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="businessName">Business Name *</Label>
                            <Input suppressHydrationWarning id="businessName" name="businessName" placeholder="e.g. ABC Restaurant" defaultValue={businessName} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category">Business Category *</Label>
                            <select
                                suppressHydrationWarning
                                id="category"
                                name="category"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                                defaultValue={displayCategory || ""}
                                required
                            >
                                <option value="" disabled>Select a category...</option>
                                {CAETGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        {isOtherCategory && (
                            <div className="space-y-2 md:col-start-2">
                                <Label htmlFor="otherCategory">Other Category</Label>
                                <Input suppressHydrationWarning id="otherCategory" name="otherCategory" defaultValue={isOtherCategory ? category : ""} placeholder="Enter category..." />
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="websiteUrl">Website (Optional)</Label>
                        <Input suppressHydrationWarning id="websiteUrl" name="websiteUrl" placeholder="https://..." defaultValue={websiteUrl} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Business Description</Label>
                        <Textarea
                            suppressHydrationWarning
                            id="description"
                            name="description"
                            className="resize-none h-24"
                            placeholder="Briefly describe what your business does..."
                            defaultValue={description}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Business Phone (Default)</Label>
                            <Input suppressHydrationWarning id="phone" name="phone" placeholder="+91..." defaultValue={phone} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Public Email (Default)</Label>
                            <Input suppressHydrationWarning id="email" name="email" type="email" placeholder="contact@..." defaultValue={email} />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4 flex justify-between items-center bg-muted/10">
                    <p className="text-sm text-muted-foreground"></p>
                    <SubmitButton suppressHydrationWarning>Save Changes</SubmitButton>
                </CardFooter>
            </ActionForm>
        </Card>
    );
}
