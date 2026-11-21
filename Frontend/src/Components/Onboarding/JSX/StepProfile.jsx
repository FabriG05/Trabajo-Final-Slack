import { useRef, useState } from 'react'
import { compressPhoto, PHOTO_MAX_BYTES } from '../../../Utils/compressPhoto'
import '../CSS/OnboardingSteps.css'
import '../CSS/StepProfile.css'

/*
    Step 2 of the onboarding wizard: the user's name and an
    optional profile photo. The photo is read locally, resized
    to a small square JPEG and handed to the parent screen as a
    base64 data URL, so both the avatar and the live preview show
    it right away while keeping what reaches the database small.
*/
const NAME_MAX_LENGTH = 50

function StepProfile({
    name,
    photo,
    onNameChange,
    onPhotoChange,
    submitting = false,
    error = null,
    onSubmit
}) {
    const fileInputRef = useRef(null)
    const [photoError, setPhotoError] = useState(null)

    const remaining = NAME_MAX_LENGTH - name.length

    function handlePickPhoto() {
        fileInputRef.current?.click()
    }

    async function handlePhotoChange(event) {
        const file = event.target.files?.[0]
        event.target.value = ''

        if (!file) {
            return
        }

        if (!file.type.startsWith('image/')) {
            setPhotoError('Please choose an image file.')
            return
        }

        if (file.size > PHOTO_MAX_BYTES) {
            setPhotoError('The image is too large. Please choose one under 5 MB.')
            return
        }

        try {
            const compressedPhoto = await compressPhoto(file)
            setPhotoError(null)
            onPhotoChange(compressedPhoto)
        } catch {
            setPhotoError('The image could not be read. Please try again.')
        }
    }

    function handleSubmit(event) {
        event.preventDefault()
        onSubmit()
    }

    return (
        <div className='onboarding-step'>
            <h2 className='onboarding-step__title'>
                What&rsquo;s your name?
            </h2>
            <p className='onboarding-step__subtitle'>
                Adding your name and profile photo helps recognise and
                connect with you more easily.
            </p>

            <form
                className='onboarding-step__form'
                onSubmit={handleSubmit}
            >
                <div className='onboarding-step__field onboarding-step__field--name'>
                    <input
                        className='onboarding-step__input'
                        id='profile-name'
                        name='profileName'
                        type='text'
                        value={name}
                        onChange={onNameChange}
                        disabled={submitting}
                        maxLength={NAME_MAX_LENGTH}
                        autoComplete='name'
                        autoFocus
                    />
                    <span className='onboarding-step__counter'>
                        {remaining}
                    </span>
                </div>

                <p className='step-profile__photo-label'>
                    <strong>Add a photo</strong> (optional)
                </p>

                <button
                    type='button'
                    className='step-profile__photo-button'
                    onClick={handlePickPhoto}
                    disabled={submitting}
                    aria-label='Add a profile photo'
                >
                    {photo ? (
                        <img
                            className='step-profile__photo-image'
                            src={photo}
                            alt='Your profile'
                        />
                    ) : (
                        <svg
                            className='step-profile__photo-placeholder'
                            viewBox='0 0 48 48'
                            aria-hidden='true'
                        >
                            <clipPath id='step-profile-avatar-clip'>
                                <rect width='48' height='48' rx='10.67' />
                            </clipPath>
                            <rect
                                width='48'
                                height='48'
                                rx='10.67'
                                fill='#e9edee'
                            />
                            <g clipPath='url(#step-profile-avatar-clip)'>
                                <circle
                                    cx='24'
                                    cy='19'
                                    r='8'
                                    fill='#26b0b8'
                                />
                                <path
                                    d='M8 52 C8 41 15.16 32 24 32 C32.84 32 40 41 40 52 Z'
                                    fill='#26b0b8'
                                />
                            </g>
                        </svg>
                    )}

                    <span className='step-profile__photo-badge'>
                        <svg
                            className='step-profile__camera-icon'
                            viewBox='0 0 24 24'
                            aria-hidden='true'
                        >
                            <path d='M9 3l1.5-2h3L15 3h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4Zm3 4.5A4.5 4.5 0 1 0 12 16.5 4.5 4.5 0 0 0 12 7.5Zm0 2A2.5 2.5 0 1 1 12 14.5 2.5 2.5 0 0 1 12 9.5Z' />
                        </svg>
                    </span>
                </button>

                <input
                    ref={fileInputRef}
                    className='step-profile__file-input'
                    type='file'
                    accept='image/*'
                    onChange={handlePhotoChange}
                    tabIndex={-1}
                    aria-hidden='true'
                />

                {photoError && (
                    <p
                        className='onboarding-step__error'
                        role='alert'
                    >
                        {photoError}
                    </p>
                )}

                {error && (
                    <p
                        className='onboarding-step__error'
                        role='alert'
                    >
                        {error}
                    </p>
                )}

                <button
                    type='submit'
                    className='onboarding-step__next'
                    disabled={submitting || name.trim().length === 0}
                >
                    {submitting ? 'Next...' : 'Next'}
                </button>
            </form>
        </div>
    )
}

export default StepProfile
