import React, { useEffect, useRef, useState } from 'react'
import '../CSS/ConfirmDialog.css'

/*
    ConfirmDialog: small modal for destructive actions.

    Props:
        title         -> main question ("Delete #general?")
        description   -> consequence explanation
        confirmLabel  -> text of the destructive button
        cancelLabel   -> text of the cancel button
        requireText   -> when set, the user must type this exact text
        onCancel      -> closes the dialog
        onConfirm     -> async callback; if it throws, the error is shown
*/
function ConfirmDialog({
    title,
    description,
    confirmLabel = 'Delete',
    cancelLabel = 'Cancel',
    requireText = null,
    onCancel,
    onConfirm
}) {
    const [typedText, setTypedText] = useState('')
    const [error, setError] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const cancelButtonRef = useRef(null)
    const textInputRef = useRef(null)

    const needsText = Boolean(requireText)
    const isConfirmed = !needsText || typedText.trim() === requireText
    const isBusy = submitting

    // Focus the safest control when the dialog opens.
    useEffect(() => {
        if (needsText) {
            textInputRef.current?.focus()
        } else {
            cancelButtonRef.current?.focus()
        }
    }, [needsText])

    // Escape closes the dialog, unless the request is already in flight.
    useEffect(() => {
        function handleKeyDown(event) {
            if (event.key === 'Escape' && !isBusy) {
                onCancel()
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isBusy, onCancel])

    // Prevent the page behind the modal from scrolling while it is open.
    useEffect(() => {
        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'

        return () => {
            document.body.style.overflow = previousOverflow
        }
    }, [])

    async function handleConfirm() {
        if (!isConfirmed || isBusy) {
            return
        }

        setSubmitting(true)
        setError(null)

        try {
            await onConfirm()
        } catch (confirmError) {
            setError(confirmError?.message || 'Something went wrong. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    function handleOverlayMouseDown(event) {
        if (event.target === event.currentTarget && !isBusy) {
            onCancel()
        }
    }

    return (
        <div
            className='confirm-dialog__overlay'
            onMouseDown={handleOverlayMouseDown}
        >
            <div
                className='confirm-dialog__panel'
                role='dialog'
                aria-modal='true'
                aria-labelledby='confirm-dialog-title'
                aria-describedby='confirm-dialog-description'
            >
                <h2 className='confirm-dialog__title' id='confirm-dialog-title'>
                    {title}
                </h2>

                {description && (
                    <p
                        className='confirm-dialog__description'
                        id='confirm-dialog-description'
                    >
                        {description}
                    </p>
                )}

                {needsText && (
                    <label className='confirm-dialog__field'>
                        <span className='confirm-dialog__label'>
                            Type <strong>{requireText}</strong> to confirm
                        </span>
                        <input
                            ref={textInputRef}
                            type='text'
                            className='confirm-dialog__input'
                            value={typedText}
                            onChange={(event) => setTypedText(event.target.value)}
                            autoComplete='off'
                            spellCheck='false'
                            disabled={isBusy}
                        />
                    </label>
                )}

                {error && (
                    <p className='confirm-dialog__error' role='alert'>{error}</p>
                )}

                <div className='confirm-dialog__actions'>
                    <button
                        ref={cancelButtonRef}
                        type='button'
                        className='confirm-dialog__btn confirm-dialog__btn--cancel'
                        onClick={onCancel}
                        disabled={isBusy}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type='button'
                        className='confirm-dialog__btn confirm-dialog__btn--danger'
                        onClick={handleConfirm}
                        disabled={!isConfirmed || isBusy}
                    >
                        {isBusy ? 'Deleting…' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmDialog
