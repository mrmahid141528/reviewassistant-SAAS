"use client"
import { useState, useRef } from "react"
import { Upload, Image as ImageIcon } from "lucide-react"
import { ImageCropperDialog } from "./image-cropper-dialog"

export default function LogoUpload({ currentLogoUrl }: { currentLogoUrl?: string | null }) {
    const [preview, setPreview] = useState<string | null>(null)
    const [isCropOpen, setIsCropOpen] = useState(false)
    const [uploadingImageSrc, setUploadingImageSrc] = useState<string | null>(null)
    const [base64Data, setBase64Data] = useState<string>("")
    const [mimeType, setMimeType] = useState<string>("")
    const inputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("File size exceeds 5MB limit.")
                if (inputRef.current) inputRef.current.value = ""
                return
            }
            setUploadingImageSrc(URL.createObjectURL(file))
            setIsCropOpen(true)
        }
    }

    const handleCropComplete = (croppedFile: File) => {
        setPreview(URL.createObjectURL(croppedFile))
        setMimeType(croppedFile.type || "image/jpeg")

        // Convert the cropped file to Base64 for reliable mobile form submission
        const reader = new FileReader();
        reader.readAsDataURL(croppedFile);
        reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1];
            setBase64Data(base64String);
        }

        // Keep standard file assignment as fallback for desktop
        if (inputRef.current) {
            try {
                const dataTransfer = new DataTransfer()
                dataTransfer.items.add(croppedFile)
                inputRef.current.files = dataTransfer.files
            } catch (e) {
                console.warn("DataTransfer not supported, falling back to base64")
            }
        }
    }

    const handleCropCancel = (open: boolean) => {
        setIsCropOpen(open)
        if (!open && inputRef.current && !preview) {
            // Reset input if they cancelled first time
            inputRef.current.value = ""
        }
    }

    const displayUrl = preview || currentLogoUrl

    return (
        <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-lg border-2 border-dashed border-muted flex items-center justify-center bg-muted/20 overflow-hidden shrink-0">
                {displayUrl ? (
                    <img src={displayUrl} alt="Logo Preview" className="h-full w-full object-cover" />
                ) : (
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                )}
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
                <label className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-muted font-medium text-foreground w-fit transition-colors">
                    <Upload className="h-4 w-4" />
                    Upload Logo
                    <input
                        ref={inputRef}
                        suppressHydrationWarning
                        type="file"
                        name="logo"
                        className="hidden"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleFileChange}
                    />
                    {/* Reliable Mobile Fallback for the cropped image */}
                    <input type="hidden" name="logoBase64" value={base64Data} suppressHydrationWarning />
                    <input type="hidden" name="logoMimeType" value={mimeType} suppressHydrationWarning />
                </label>
                <p>PNG, JPG or WebP • Max 5MB</p>
            </div>

            {uploadingImageSrc && (
                <ImageCropperDialog
                    isOpen={isCropOpen}
                    onOpenChange={handleCropCancel}
                    imageSrc={uploadingImageSrc}
                    onCropComplete={handleCropComplete}
                />
            )}
        </div>
    )
}
