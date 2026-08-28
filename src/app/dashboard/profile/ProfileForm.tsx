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
                                Email Address
                            </Label>
                            <Input id="email" type="email" name="email" defaultValue={authUser?.email || ""} required />
                            <p className="text-xs text-muted-foreground mt-1">If you change your email, a confirmation link will be sent to your new address.</p>
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
    );
}
