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
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { updateReviewExperience } from "../actions"

export const dynamic = "force-dynamic";

export default async function ReviewExperiencePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let reviewFlow = "smart"
    let draftEditing = true
    let copyReviewButton = true
    let redirectAfterCopy = true
    let customerFeedbackProtection = true
    let privateFeedbackThreshold = 3

    if (user) {
        const membership = await prisma.businessMember.findFirst({
            where: { userId: user.id }
        })
        if (membership) {
            const campaign = await prisma.campaign.findFirst({ where: { businessId: membership.businessId } })
            if (campaign?.settings) {
                const settings = campaign.settings as any
                reviewFlow = settings.reviewFlow || "smart"
                draftEditing = settings.draftEditing !== undefined ? settings.draftEditing : true;
                copyReviewButton = settings.copyReviewButton !== undefined ? settings.copyReviewButton : true;
                redirectAfterCopy = settings.redirectAfterCopy !== undefined ? settings.redirectAfterCopy : true;
                customerFeedbackProtection = settings.customerFeedbackProtection !== undefined ? settings.customerFeedbackProtection : true;
                privateFeedbackThreshold = settings.privateFeedbackThreshold || 3;
            }
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Review Experience</h3>
                <p className="text-sm text-muted-foreground">
                    Control how customers interact with your Review Assistant.
                </p>
            </div>

            <Card>
                <ActionForm action={updateReviewExperience}>
                    <CardHeader>
                        <CardTitle>Customer Flow</CardTitle>
                        <CardDescription>
                            Configure the end-to-end journey for your customers.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">

                        <div className="space-y-3">
                            <Label>Review Flow</Label>
                            <RadioGroup name="reviewFlow" defaultValue={reviewFlow}>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="smart" id="r-smart" />
                                    <Label htmlFor="r-smart" className="font-normal">Smart Review Flow (Generates AI drafts based on Q&A)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="direct" id="r-direct" />
                                    <Label htmlFor="r-direct" className="font-normal">Direct Google Review (Sends straight to Google)</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Review Draft Editing</Label>
                                <p className="text-sm text-muted-foreground">
                                    Allow customers to review and edit AI-generated reviews before posting.
                                </p>
                            </div>
                            <Switch name="draftEditing" defaultChecked={draftEditing} value="on" />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Show "Copy Review" button</Label>
                                <p className="text-sm text-muted-foreground">
                                    Provide a single-click button for customers to copy the text.
                                </p>
                            </div>
                            <Switch name="copyReviewButton" defaultChecked={copyReviewButton} value="on" />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Google Review Redirect</Label>
                                <p className="text-sm text-muted-foreground">
                                    Automatically open Google Review page after copying.
                                </p>
                            </div>
                            <Switch name="redirectAfterCopy" defaultChecked={redirectAfterCopy} value="on" />
                        </div>

                        <div className="border-t pt-8 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Customer Feedback Protection</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Collect private feedback before sending them to Google when a low rating is given.
                                    </p>
                                </div>
                                <Switch name="customerFeedbackProtection" defaultChecked={customerFeedbackProtection} value="on" />
                            </div>

                            <div className="space-y-3 mt-4">
                                <Label>Private Feedback Threshold</Label>
                                <RadioGroup name="privateFeedbackThreshold" defaultValue={privateFeedbackThreshold.toString()} className="flex gap-4">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <div key={star} className="flex items-center space-x-2">
                                            <RadioGroupItem value={star.toString()} id={`star-${star}`} />
                                            <Label htmlFor={`star-${star}`}>⭐ {star}</Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Ratings equal to or below this threshold will trigger a private feedback form instead of redirecting directly.
                                </p>
                            </div>
                        </div>

                        <div className="bg-blue-50/50 p-4 border border-blue-100 rounded-md mt-6">
                            <h4 className="text-sm font-semibold text-blue-900 mb-1">Location review configurations</h4>
                            <p className="text-sm text-blue-800">
                                Google review destination URLs are configured separately for each location.
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
