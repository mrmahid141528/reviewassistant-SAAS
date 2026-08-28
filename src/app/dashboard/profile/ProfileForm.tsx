"use client";

import { useState, useRef } from "react";
import { ActionForm } from "@/components/ui/action-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { updateProfile } from "./actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { ImageCropperDialog } from "@/components/dashboard/image-cropper-dialog";
import { deleteBusinessAccount, changePassword } from "../settings/actions";

export function ProfileForm({
    dbUser,
    authUser
}: {
    dbUser: any;
    authUser: any;
}) {
    const [preview, setPreview] = useState<string | null>(null);
    const [isCropOpen, setIsCropOpen] = useState(false);
    const [uploadingImageSrc, setUploadingImageSrc] = useState<string | null>(null);
    const [isRemoved, setIsRemoved] = useState(false);
    const [base64Data, setBase64Data] = useState<string>("");
    const [mimeType, setMimeType] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("File size exceeds 5MB limit.");
                if (fileInputRef.current) fileInputRef.current.value = "";
                return;
            }
            setUploadingImageSrc(URL.createObjectURL(file));
            setIsCropOpen(true);
        }
    };

    const handleCropComplete = (croppedFile: File) => {
        setPreview(URL.createObjectURL(croppedFile));
        setIsRemoved(false); // Resets removed state if user uploaded new
        setMimeType(croppedFile.type || "image/jpeg");

        // Convert the cropped file to Base64 for reliable mobile form submission
        const reader = new FileReader();
        reader.readAsDataURL(croppedFile);
        reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1];
            setBase64Data(base64String);
        }

        if (fileInputRef.current) {
            try {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(croppedFile);
                fileInputRef.current.files = dataTransfer.files;
            } catch (e) {
                console.warn("DataTransfer not supported, falling back to base64");
            }
        }

        setUploadingImageSrc(null); // safely clears source state
    };

    const handleCropCancel = (open: boolean) => {
        setIsCropOpen(open); // will be false when cancelling
        if (!open) {
            if (fileInputRef.current && !preview && !isRemoved) {
                fileInputRef.current.value = "";
            }
            // Clear source after slight delay to allow dialog close animation
            setTimeout(() => setUploadingImageSrc(null), 300);
        }
    };

    const handleRemovePhoto = () => {
        setPreview(null);
        setIsRemoved(true); // Track intent to remove
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const displayUrl = preview || (isRemoved ? null : dbUser?.image);
    // Extract language from metadata if it exists, default to English
    const language = authUser?.user_metadata?.language || "English";

    return (
        <div className="space-y-12">
            <ActionForm action={updateProfile} className="space-y-8">
                {/* Hidden flag explicitly tells backend to wipe image if true */}
                <input type="hidden" name="removeAvatar" value={isRemoved ? "true" : "false"} />
                <input type="hidden" name="avatarBase64" value={base64Data} suppressHydrationWarning />
                <input type="hidden" name="avatarMimeType" value={mimeType} suppressHydrationWarning />

                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-6 pb-2 border-b">
                            <div className="h-20 w-20 rounded-full bg-muted border overflow-hidden shrink-0 flex items-center justify-center">
                                {displayUrl ? (
                                    <img src={displayUrl} alt="Avatar" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="text-primary font-bold text-2xl h-full w-full flex items-center justify-center bg-primary/10">
                                        {(dbUser?.name || "U").charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1">
                                <span className="font-semibold text-sm">Profile Photo</span>
                                <div className="flex gap-2">
                                    <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                                        Upload photo
                                    </Button>
                                    <Button type="button" variant="ghost" size="sm" onClick={handleRemovePhoto} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                                        Remove photo
                                    </Button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        name="avatar"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" name="name" defaultValue={dbUser?.name || ""} placeholder="Your Name" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input id="phone" name="phone" defaultValue="" placeholder="+91 XXXXX XXXXX" />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="email" className="flex items-center gap-2">
                                    Email Address (Locked)
                                </Label>
                                <Input id="email" type="email" name="email" defaultValue={authUser?.email || ""} disabled={true} className="bg-muted opacity-70" />
                                <p className="text-xs text-muted-foreground mt-1">Your signup email is set as your default authentication identity and cannot be changed here.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Preferences</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="max-w-md space-y-2">
                            <Label htmlFor="language">Language</Label>
                            <select
                                id="language"
                                name="language"
                                defaultValue={language}
                                className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="English">English</option>
                                <option value="Hindi">Hindi (Beta)</option>
                            </select>
                        </div>
                    </CardContent>
                    <CardFooter className="py-4 px-6 border-t bg-muted/10">
                        <SubmitButton>Save All Changes</SubmitButton>
                    </CardFooter>
                </Card>

                {uploadingImageSrc && (
                    <ImageCropperDialog
                        isOpen={isCropOpen}
                        onOpenChange={handleCropCancel}
                        imageSrc={uploadingImageSrc}
                        onCropComplete={handleCropComplete}
                    />
                )}
            </ActionForm>

            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium">Security</h3>
                    <p className="text-sm text-muted-foreground">
                        Manage your account security.
                    </p>
                </div>

                <Card>
                    <ActionForm action={changePassword}>
                        <CardHeader>
                            <CardTitle>Change Password</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="max-w-sm space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">New Password</Label>
                                    <Input type="password" id="password" name="password" required minLength={6} placeholder="Min. 6 characters" />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <SubmitButton>Update Password</SubmitButton>
                        </CardFooter>
                    </ActionForm>
                </Card>

                <div className="mt-8 border border-red-200 rounded-lg overflow-hidden">
                    <Card className="border-0 shadow-none rounded-none rounded-t-lg bg-red-50/50">
                        <ActionForm action={deleteBusinessAccount}>
                            <CardHeader>
                                <CardTitle className="text-red-600 flex items-center gap-2">
                                    Danger Zone
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-red-900/80 mb-4">
                                    This permanently deletes your business, locations, campaigns, QR codes and analytics.
                                </p>
                                <SubmitButton className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600">Delete Business Account</SubmitButton>
                            </CardContent>
                        </ActionForm>
                    </Card>
                </div>
            </div>
        </div>
    );
}
