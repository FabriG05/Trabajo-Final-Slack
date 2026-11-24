import React, { useEffect, useRef, useState } from 'react'
import { useWorkspace } from '../../../Context/WorkspaceContext'
import { compressPhoto } from '../../../Utils/compressPhoto'
import { IconUser } from './SlackIcons'
import '../CSS/ProfileView.css'

const STATUS_LABELS = {
    online: 'Online',
    away: 'Away',
    offline: 'Offline',
    'do not disturb': 'Do not disturb'
}

function ProfileView() {
    const { currentUser, userStatus, changeProfilePhoto, updateProfileName } = useWorkspace()
    const [name, setName] = useState(currentUser?.displayName || currentUser?.username || '')
    const [savingName, setSavingName] = useState(false)
    const [nameError, setNameError] = useState(null)
    const [nameSaved, setNameSaved] = useState(false)
    const [photoError, setPhotoError] = useState(null)
    const [savingPhoto, setSavingPhoto] = useState(false)
    const photoInputRef = useRef(null)

    useEffect(() => {
        setName(currentUser?.displayName || currentUser?.username || '')
    }, [currentUser?.displayName, currentUser?.username])

    const displayName = currentUser?.displayName || currentUser?.username || 'User'
    const email = currentUser?.email || ''
    const statusLabel = STATUS_LABELS[userStatus] || 'Online'

    async function handlePhotoChange(event) {
        const file = event.target.files?.[0]
        event.target.value = ''

        if (!file) return

        if (!file.type.startsWith('image/')) {
            setPhotoError('Please choose an image file.')
            return
        }

        try {
            setSavingPhoto(true)
            setPhotoError(null)
            const compressedPhoto = await compressPhoto(file)
            await changeProfilePhoto(compressedPhoto)
        } catch {
            setPhotoError('The image could not be updated. Please try again.')
        } finally {
            setSavingPhoto(false)
        }
    }

    async function handleSaveName(event) {
        event.preventDefault()
        const trimmedName = name.trim()

        if (!trimmedName) {
            setNameError('Name cannot be empty.')
            setNameSaved(false)
            return
        }

        if (trimmedName === (currentUser?.displayName || currentUser?.username || '')) {
            setNameError(null)
            setNameSaved(false)
            return
        }

        try {
            setSavingName(true)
            setNameError(null)
            setNameSaved(false)
            await updateProfileName(trimmedName)
            setNameSaved(true)
        } catch (error) {
            setNameError(error.message || 'Could not update your name. Please try again.')
        } finally {
            setSavingName(false)
        }
    }

    return (
        <main className='profile-view' aria-label='Profile'>
            <header className='profile-view__header'>
                <div>
                    <h2 className='profile-view__title'>Profile</h2>
                    <p className='profile-view__subtitle'>Manage your personal information</p>
                </div>
            </header>

            <div className='profile-view__content'>
                <section className='profile-view__card' aria-label='Profile overview'>
                    <div className='profile-view__avatar-section'>
                        <div className='profile-view__avatar-wrap'>
                            {currentUser?.photo ? (
                                <img
                                    className='profile-view__avatar'
                                    src={currentUser.photo}
                                    alt={displayName}
                                />
                            ) : (
                                <div className='profile-view__avatar profile-view__avatar--fallback' aria-hidden='true'>
                                    <IconUser size={40} />
                                </div>
                            )}
                            <span className='profile-view__status-dot' data-status={userStatus} title={statusLabel} />
                        </div>

                        <div className='profile-view__avatar-actions'>
                            <p className='profile-view__name'>{displayName}</p>
                            <p className='profile-view__status' data-status={userStatus}>{statusLabel}</p>
                            <button
                                type='button'
                                className='profile-view__photo-btn'
                                onClick={() => photoInputRef.current?.click()}
                                disabled={savingPhoto}
                            >
                                {savingPhoto ? 'Uploading...' : 'Change profile photo'}
                            </button>
                            <input
                                ref={photoInputRef}
                                type='file'
                                accept='image/*'
                                onChange={handlePhotoChange}
                                tabIndex={-1}
                                aria-hidden='true'
                                className='profile-view__file-input'
                            />
                            {photoError && <p className='profile-view__error' role='alert'>{photoError}</p>}
                        </div>
                    </div>
                </section>

                <section className='profile-view__card' aria-label='Edit profile'>
                    <form className='profile-view__form' onSubmit={handleSaveName}>
                        <label className='profile-view__field'>
                            <span className='profile-view__label'>Full name</span>
                            <input
                                className='profile-view__input'
                                type='text'
                                value={name}
                                onChange={(event) => {
                                    setName(event.target.value)
                                    setNameError(null)
                                    setNameSaved(false)
                                }}
                                placeholder='Your name'
                                autoComplete='name'
                            />
                        </label>

                        <label className='profile-view__field'>
                            <span className='profile-view__label'>Email</span>
                            <input
                                className='profile-view__input profile-view__input--readonly'
                                type='email'
                                value={email}
                                readOnly
                                disabled
                            />
                        </label>

                        <div className='profile-view__form-actions'>
                            <button
                                type='submit'
                                className='profile-view__save-btn'
                                disabled={savingName}
                            >
                                {savingName ? 'Saving...' : 'Save changes'}
                            </button>
                            {nameSaved && <span className='profile-view__saved'>Saved</span>}
                            {nameError && <p className='profile-view__error' role='alert'>{nameError}</p>}
                        </div>
                    </form>
                </section>
            </div>
        </main>
    )
}

export default ProfileView
