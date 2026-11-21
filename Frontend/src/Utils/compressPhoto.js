/*
    Reads an image file, draws the central square crop on a canvas
    at PHOTO_OUTPUT_SIZE and returns it as a JPEG data URL. Shared by
    the onboarding profile step and the workspace nav status menu.
*/

// The user may pick a large original; the client compresses it
// down before anything is sent, so only the output size matters.
const PHOTO_MAX_BYTES = 5 * 1024 * 1024

// Rendered avatars are small (26-72px); 256px keeps some headroom
// for retina screens while staying around ~50-100 KB as JPEG.
const PHOTO_OUTPUT_SIZE = 256
const PHOTO_JPEG_QUALITY = 0.85

function compressPhoto(file) {
    return new Promise((resolve, reject) => {
        const imageUrl = URL.createObjectURL(file)
        const image = new Image()

        image.onload = () => {
            URL.revokeObjectURL(imageUrl)

            const canvas = document.createElement('canvas')
            canvas.width = PHOTO_OUTPUT_SIZE
            canvas.height = PHOTO_OUTPUT_SIZE

            const context = canvas.getContext('2d')
            if (!context) {
                reject(new Error('The image could not be processed.'))
                return
            }

            // Center-crop the image to a square, like object-fit: cover.
            const side = Math.min(image.naturalWidth, image.naturalHeight)
            const offsetX = (image.naturalWidth - side) / 2
            const offsetY = (image.naturalHeight - side) / 2

            context.drawImage(
                image,
                offsetX,
                offsetY,
                side,
                side,
                0,
                0,
                PHOTO_OUTPUT_SIZE,
                PHOTO_OUTPUT_SIZE
            )

            resolve(canvas.toDataURL('image/jpeg', PHOTO_JPEG_QUALITY))
        }

        image.onerror = () => {
            URL.revokeObjectURL(imageUrl)
            reject(new Error('The image could not be read. Please try again.'))
        }

        image.src = imageUrl
    })
}

export { compressPhoto, PHOTO_MAX_BYTES }
