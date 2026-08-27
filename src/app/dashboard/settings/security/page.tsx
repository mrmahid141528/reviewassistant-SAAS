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
import { deleteBusinessAccount, changePassword, signOutOtherSessions } from "../actions"

export const dynamic = "force-dynamic";

export default function SecurityPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Security</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your account security and authentication.
                </p>
            </div>

            <Card>
                <ActionForm action={changePassword}>
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>
                            Enter a new password for your account.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="max-w-sm space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="password" className="text-sm font-medium">New Password</label>
                                <Input type="password" id="password" name="password" required minLength={6} placeholder="Min. 6 characters" />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <SubmitButton>Update Password</SubmitButton>
                    </CardFooter>
                </ActionForm>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Active Sessions</CardTitle>
                    <CardDescription>
                        Devices and browsers currently logged into your account.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 pb-4 border-b">
                        <div>
                            <p className="font-medium">Current Session</p>
                            <p className="text-sm text-muted-foreground">The device you are currently using.</p>
                        </div>
                    </div>
                    <ActionForm action={signOutOtherSessions}>
                        <SubmitButton variant="outline" className="text-primary mt-2">Sign out other sessions</SubmitButton>
                    </ActionForm>
                </CardContent>
            </Card>

            <div className="mt-8 border border-red-200 rounded-lg overflow-hidden">
                <Card className="border-0 shadow-none rounded-none rounded-t-lg bg-red-50/50">
                    <ActionForm action={deleteBusinessAccount}>
                        <CardHeader>
                            <CardTitle className="text-red-600 flex items-center gap-2">
                                Danger Zone
                            </CardTitle>
                            <CardDescription className="text-red-900/80">
                                This permanently deletes your business, locations, campaigns, QR codes and analytics.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <SubmitButton className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600">Delete Business Account</SubmitButton>
                        </CardContent>
                    </ActionForm>
                </Card>
            </div>
        </div>
    );
}
