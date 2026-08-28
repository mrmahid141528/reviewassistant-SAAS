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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { updateAIAssistantSettings } from "../actions"

export const dynamic = "force-dynamic";

export default async function AIAssistantPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let aiLanguage = "Auto-detect"
    let aiTone = "Friendly & Natural"
    let reviewLength = "Medium"
    let customInstructions = ""
    let aboutBusiness = ""
    let writingStyleNames: string[] = ["Natural sounding", "Mention specific experience"]

    if (user) {
        const membership = await prisma.businessMember.findFirst({
            where: { userId: user.id },
            include: { business: true }
        })
        if (membership) {
            const campaign = await prisma.campaign.findFirst({ where: { businessId: membership.businessId } })
            if (campaign?.settings) {
                const settings = campaign.settings as any
                aiLanguage = settings.aiLanguage || "Auto-detect"
                aiTone = settings.aiTone || "Friendly & Natural"
                reviewLength = settings.reviewLength || "Medium"
                customInstructions = settings.additionalInstructions || ""
                if (settings.writingStyle) {
                    writingStyleNames = settings.writingStyle
                }
            }

            const businessSettings = membership.business.settings as any;
            if (businessSettings?.aboutBusiness) {
                aboutBusiness = businessSettings.aboutBusiness;
            }
        }
    }

    const LANGUAGES = ["Auto-detect", "English", "Hindi", "Hinglish", "Bengali", "Hindi + English"];
    const TONES = ["Friendly & Natural", "Professional", "Warm & Personal", "Casual", "Short & Simple", "Detailed"];
    const STYLES = ["Natural sounding", "Avoid exaggerated claims", "Keep customer wording", "Mention specific experience"];

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">AI Assistant</h3>
                <p className="text-sm text-muted-foreground">
                    Customize how Review Assistant generates review drafts.
                </p>
            </div>

            <Card>
                <ActionForm action={updateAIAssistantSettings}>
                    <CardHeader>
                        <CardTitle>Business Defaults</CardTitle>
                        <CardDescription>
                            These settings apply to all locations unless a location has custom settings.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="aiLanguage">Output Language *</Label>
                                <select
                                    id="aiLanguage"
                                    name="aiLanguage"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                                    defaultValue={aiLanguage}
                                >
                                    {LANGUAGES.map(lang => (
                                        <option key={lang} value={lang}>{lang}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="aiTone">Review Tone</Label>
                                <select
                                    id="aiTone"
                                    name="aiTone"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                                    defaultValue={aiTone}
                                >
                                    {TONES.map(tone => (
                                        <option key={tone} value={tone}>{tone}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label>Review Length</Label>
                            <RadioGroup name="reviewLength" defaultValue={reviewLength} className="flex flex-wrap gap-4 sm:gap-6">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Short" id="len-short" />
                                    <Label htmlFor="len-short" className="font-normal">Short</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Medium" id="len-medium" />
                                    <Label htmlFor="len-medium" className="font-normal">Medium</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Detailed" id="len-detailed" />
                                    <Label htmlFor="len-detailed" className="font-normal">Detailed</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className="space-y-3">
                            <Label>Writing Style</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2">
                                {STYLES.map(style => (
                                    <div className="flex items-center space-x-2" key={style}>
                                        <Checkbox
                                            id={`style-${style}`}
                                            name="writingStyle"
                                            value={style}
                                            defaultChecked={writingStyleNames.includes(style)}
                                        />
                                        <Label htmlFor={`style-${style}`} className="font-normal cursor-pointer">{style}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="additionalInstructions">Additional Instructions</Label>
                            <Textarea
                                id="additionalInstructions"
                                name="additionalInstructions"
                                className="resize-none h-24"
                                placeholder="e.g. Keep reviews natural and mention our friendly staff when the customer talks about service."
                                defaultValue={customInstructions}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                AI uses customer-provided feedback as the primary source for review drafts. These instructions help fine-tune the output.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="aboutBusiness">About Your Business</Label>
                            <Textarea
                                id="aboutBusiness"
                                name="aboutBusiness"
                                className="resize-none h-24"
                                placeholder="What should AI know about your business? (e.g. We provide printing, online form filling, and internet services.)"
                                defaultValue={aboutBusiness}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                This acts as a global business context. Locations can add specific context in Locations → Manage → AI Context.
                            </p>
                        </div>

                    </CardContent>
                    <CardFooter className="border-t px-6 py-4 flex justify-between items-center bg-muted/10">
                        <p className="text-sm text-muted-foreground"></p>
                        <SubmitButton>Save Changes</SubmitButton>
                    </CardFooter>
                </ActionForm>
            </Card>
        </div>
    );
}
