import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { SubmitButton } from "@/components/ui/submit-button";
import { ActionForm } from "@/components/ui/action-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma"

import { inviteTeamMember } from "../actions"

export const dynamic = "force-dynamic";

export default async function TeamPermissionsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null;

    // Get current business and members
    const businessMap = await prisma.businessMember.findFirst({
        where: { userId: user.id },
        include: {
            business: {
                include: {
                    members: { include: { user: true, location: true } },
                    locations: true
                }
            }
        }
    });

    const business = businessMap?.business;

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Team & Permissions</h3>
                <p className="text-sm text-muted-foreground">
                    Manage who has access to your business account and their roles.
                </p>
            </div>

            <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-background/60 backdrop-blur-[1.5px] z-10 flex items-center justify-center">
                    <span className="bg-primary text-primary-foreground font-semibold px-4 py-1.5 rounded-full text-sm shadow-md ring-2 ring-primary/20">Coming Soon</span>
                </div>
                <div className="opacity-60 pointer-events-none">
                    <CardHeader>
                        <CardTitle>Team Members</CardTitle>
                        <CardDescription>
                            People who have access to manage this business.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Empty for now as feature is locked */}
                            <div className="flex items-center justify-between border-b pb-4">
                                <div>
                                    <p className="font-medium">Manager User</p>
                                    <p className="text-sm text-muted-foreground">
                                        demo@example.com • All locations
                                    </p>
                                </div>
                                <div className="text-sm bg-muted px-2 py-1 rounded-md font-medium capitalize">
                                    Branch Manager
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </div>
            </Card>

            <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-background/60 backdrop-blur-[1.5px] z-10 flex items-center justify-center">
                    <span className="bg-primary text-primary-foreground font-semibold px-4 py-1.5 rounded-full text-sm shadow-md ring-2 ring-primary/20">Coming Soon</span>
                </div>
                <div className="opacity-60 pointer-events-none">
                    <CardHeader>
                        <CardTitle>Invite Member</CardTitle>
                        <CardDescription>
                            Send an invitation to grant someone access.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email address *</Label>
                                <Input suppressHydrationWarning id="email" name="email" type="email" placeholder="manager@example.com" disabled />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Role *</Label>
                                <select
                                    disabled
                                    suppressHydrationWarning
                                    id="role"
                                    name="role"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background opacity-50"
                                >
                                    <option value="manager">Branch Manager</option>
                                    <option value="admin">Admin</option>
                                    <option value="viewer">Viewer</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location">Location Access</Label>
                            <select
                                disabled
                                suppressHydrationWarning
                                id="location"
                                name="location"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background opacity-50"
                            >
                                <option value="all">All Locations (Global)</option>
                                {business?.locations.map(loc => (
                                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                                ))}
                            </select>
                            <p className="text-xs text-muted-foreground mt-1">
                                Admins automatically have access to all locations.
                            </p>
                        </div>
                    </CardContent>
                    <div className="px-6 pb-6 mt-4">
                        <SubmitButton disabled suppressHydrationWarning>Send Invitation</SubmitButton>
                    </div>
                </div>
            </Card>
        </div>
    );
}
