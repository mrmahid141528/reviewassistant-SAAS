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
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"

import { updateNotifications } from "../actions"
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Notifications</h3>
                <p className="text-sm text-muted-foreground">
                    Configure your email preferences for business alerts and reports.
                </p>
            </div>

            <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-background/60 backdrop-blur-[1.5px] z-10 flex items-center justify-center">
                    <span className="bg-primary text-primary-foreground font-semibold px-4 py-1.5 rounded-full text-sm shadow-md ring-2 ring-primary/20">Coming Soon</span>
                </div>
                <div className="opacity-60 pointer-events-none">
                    <CardHeader>
                        <CardTitle>Email Notifications</CardTitle>
                        <CardDescription>
                            Select the types of alerts and reports you want to receive.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">

                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox disabled id="weeklySummary" name="weeklySummary" defaultChecked />
                                <Label htmlFor="weeklySummary" className="font-normal opacity-70">Weekly performance summary</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox disabled id="monthlyReport" name="monthlyReport" />
                                <Label htmlFor="monthlyReport" className="font-normal opacity-70">Monthly report</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox disabled id="lowRating" name="lowRating" defaultChecked />
                                <Label htmlFor="lowRating" className="font-normal opacity-70">Low-rating feedback alert</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox disabled id="usageWarning" name="usageWarning" defaultChecked />
                                <Label htmlFor="usageWarning" className="font-normal opacity-70">Usage limit warning</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox disabled id="billing" name="billing" defaultChecked />
                                <Label htmlFor="billing" className="font-normal opacity-70">Subscription and billing notifications</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox disabled id="productUpdates" name="productUpdates" />
                                <Label htmlFor="productUpdates" className="font-normal opacity-70">Product updates and announcements</Label>
                            </div>
                        </div>

                        <div className="space-y-2 border-t pt-6">
                            <Label htmlFor="notificationEmail" className="opacity-70">Notification Email</Label>
                            <Input disabled id="notificationEmail" name="notificationEmail" type="email" placeholder="owner@gmail.com" defaultValue={user?.email || ""} className="opacity-50" />
                            <p className="text-xs text-muted-foreground mt-1 text-balance">
                                By default, notifications are sent to your account email. You can specify a different email here if preferred.
                            </p>
                        </div>

                    </CardContent>
                    <CardFooter className="border-t px-6 py-4 flex justify-between items-center bg-muted/10">
                        <p className="text-sm text-muted-foreground"></p>
                        <SubmitButton disabled>Save Changes</SubmitButton>
                    </CardFooter>
                </div>
            </Card>
        </div>
    );
}
