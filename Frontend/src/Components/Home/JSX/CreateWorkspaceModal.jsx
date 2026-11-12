import { useEffect } from 'react'
import useForm from '../../../Hooks/useForm'
import AuthField from '../../Auth/JSX/AuthField'
import AuthAlert from '../../Auth/JSX/AuthAlert'
import '../CSS/CreateWorkspaceModal.css'

/*
    Modal dialog to create a workspace. Fields: name (required)
    and description (optional). On success the parent refreshes
    the list and we stay on the home screen.
*/
function CreateWorkspaceModal({
    open,
    submitting = false,
    error = null,
    onClose,
    onSubmit
}) {
    const initialState = { name: '', description: '' }
    const { formState, handleChangeInput } = useForm(initialState)

    // Escape closes the modal while it is open (not while submitting).
    useEffect(
        () => {
            if (!open || submitting) {
                return
            }

            function handleKeyDown(event) {
                if (event.key === 'Escape') {
                    onClose()
                }
            }

            window.addEventListener('keydown', handleKeyDown)
            return () => window.removeEventListener('keydown', handleKeyDown)
        },
        [open, submitting, onClose]
    )

    if (!open) {
        return null
    }

    function handleSubmit(event) {
        event.preventDefault()
        onSubmit(formState.name, formState.description)
    }

    return (
        <div
            className='create-workspace-modal__backdrop'
            onClick={submitting ? undefined : onClose}
        >
            <div
                className='create-workspace-modal'
                role='dialog'
                aria-modal='true'
                aria-labelledby='create-workspace-title'
                onClick={(event) => event.stopPropagation()}
            >
                <h2
                    className='create-workspace-modal__title'
                    id='create-workspace-title'
                >
                    Create a workspace
                </h2>
                <p className='create-workspace-modal__subtitle'>
                    Workspaces are where your team communicates and collaborates.
                </p>

                {error && (
                    <AuthAlert type='error' message={error} />
                )}

                <form onSubmit={handleSubmit}>
                    <AuthField
                        id='workspace-name'
                        label='Name'
                        name='name'
                        type='text'
                        value={formState.name}
                        onChange={handleChangeInput}
                        disabled={submitting}
                        placeholder='My company'
                        autoComplete='off'
                        required
                    />
                    <AuthField
                        id='workspace-description'
                        label='Description (optional)'
                        name='description'
                        type='text'
                        value={formState.description}
                        onChange={handleChangeInput}
                        disabled={submitting}
                        placeholder='What is this workspace for?'
                        autoComplete='off'
                    />

                    <div className='create-workspace-modal__actions'>
                        <button
                            type='button'
                            className='create-workspace-modal__button create-workspace-modal__button--secondary'
                            onClick={onClose}
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            type='submit'
                            className='create-workspace-modal__button create-workspace-modal__button--primary'
                            disabled={submitting}
                        >
                            {submitting ? 'Creating...' : 'Create workspace'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreateWorkspaceModal
