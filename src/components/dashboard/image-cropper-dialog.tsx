'use client'

import React, { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { getCroppedImg } from '@/lib/cropImage'
import { ZoomIn, ZoomOut } from 'lucide-react'

interface ImageCropperDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    imageSrc: string | null
    onCropComplete: (croppedFile: File) => void
}

export function ImageCropperDialog({ isOpen, onOpenChange, imageSrc, onCropComplete }: ImageCropperDialogProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
    const [isSaving, setIsSaving] = useState(false)

    const handleCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const handleSave = async () => {
        if (!imageSrc || !croppedAreaPixels) return

        try {
            setIsSaving(true)
            const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels)
            if (croppedFile) {
                onCropComplete(croppedFile)
                onOpenChange(false)
            }
        } catch (e) {
            console.error('Failed to crop image', e)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Adjust Image</DialogTitle>
                    <DialogDescription className="sr-only">Crop and adjust your image</DialogDescription>
                </DialogHeader>
                <div className="relative w-full h-[300px] mt-2 mb-6 bg-black/5 rounded-md overflow-hidden">
                    {imageSrc && (
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={1} // Square aspect ratio
                            onCropChange={setCrop}
                            onCropComplete={handleCropComplete}
                            onZoomChange={setZoom}
                        />
                    )}
                </div>

                <div className="flex items-center gap-4 mb-4">
                    <ZoomOut className="w-4 h-4 text-muted-foreground shrink-0" />
                    <Slider
                        value={[typeof zoom === 'number' && !isNaN(zoom) ? zoom : 1]}
                        min={0.1}
                        max={3}
                        step={0.1}
                        onValueChange={(val) => setZoom(Array.isArray(val) ? val[0] : (val as unknown as number))}
                    />
                    <ZoomIn className="w-4 h-4 text-muted-foreground shrink-0" />
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={handleSave} disabled={isSaving || !imageSrc}>
                        {isSaving ? "Cropping..." : "Save Image"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
