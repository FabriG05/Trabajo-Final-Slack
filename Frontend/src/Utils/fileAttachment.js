const MAX_ATTACHMENT_SIZE_BYTES = 2 * 1024 * 1024

const ALLOWED_IMAGE_TYPES = new Set([
    'image/gif',
    'image/jpeg',
    'image/png',
    'image/webp'
])

export function isAllowedAttachment(file) {
    return Boolean(file) && (file.type === 'application/pdf' || ALLOWED_IMAGE_TYPES.has(file.type) || file.type.startsWith('image/'))
}

export function validateAttachmentFile(file) {
    if (!file) {
        return 'No file selected.'
    }

    if (!(file.type === 'application/pdf' || file.type.startsWith('image/'))) {
        return 'Only images and PDF files are allowed.'
    }

    if (file.type.startsWith('image/') && !ALLOWED_IMAGE_TYPES.has(file.type)) {
        return 'Only GIF, JPEG, PNG, WEBP images and PDF files are allowed.'
    }

    if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
        return 'File is too large. Maximum size is 2MB.'
    }

    return null
}

export function readFileAsAttachment(file) {
    return new Promise((resolve, reject) => {
        const validationError = validateAttachmentFile(file)

        if (validationError) {
            reject(new Error(validationError))
            return
        }

        const reader = new FileReader()

        reader.onload = () => {
            resolve({
                data: String(reader.result || ''),
                name: file.name,
                mimeType: file.type,
                size: file.size
            })
        }

        reader.onerror = () => {
            reject(new Error('Could not read the selected file.'))
        }

        reader.readAsDataURL(file)
    })
}

export function formatFileSize(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) {
        return ''
    }

    if (bytes < 1024 * 1024) {
        return `${Math.max(1, Math.round(bytes / 1024))} KB`
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
