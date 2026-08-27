export const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image()
        image.addEventListener('load', () => resolve(image))
        image.addEventListener('error', (error) => {
            console.error("Error loading image for crop:", error);
            reject(error)
        })
        image.src = url
    })

export async function getCroppedImg(
    imageSrc: string,
    pixelCrop: { x: number; y: number; width: number; height: number },
    flip = { horizontal: false, vertical: false }
): Promise<File | null> {
    try {
        const image = await createImage(imageSrc)
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
            console.error("No 2d context");
            return null
        }

        // Set the size of the cropped canvas
        canvas.width = pixelCrop.width
        canvas.height = pixelCrop.height

        // Draw the cropped image onto the canvas
        // ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height, // Source dimensions
            0,
            0,
            pixelCrop.width,
            pixelCrop.height // Destination dimensions
        )

        // As a blob/file
        return new Promise((resolve, reject) => {
            canvas.toBlob((file) => {
                if (file) {
                    // Unique name to avoid browser caching
                    const timestamp = new Date().getTime();
                    const finalFile = new File([file], `cropped-${timestamp}.jpg`, { type: "image/jpeg" })
                    resolve(finalFile)
                } else {
                    console.error("Canvas toBlob failed");
                    reject(new Error("Canvas is empty"))
                }
            }, 'image/jpeg', 1.0) // 1.0 Quality
        })
    } catch (err) {
        console.error("Error in getCroppedImg utility:", err);
        return null;
    }
}
