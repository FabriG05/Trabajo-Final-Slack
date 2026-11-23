import React, { useEffect, useRef, useState } from 'react'
import { useWorkspace } from '../../../Context/WorkspaceContext'
import InvitePeopleDialog from './InvitePeopleDialog'
import NewMessageDialog from './NewMessageDialog'
import '../CSS/WorkspaceAdminMenu.css'
import '../CSS/CreateMoreMenu.css'

function CreateMoreMenu({ onClose }) {
    const { addChannel } = useWorkspace()
    const menuRef = useRef(null)
    const [dialog, setDialog] = useState(null) // 'message' | 'channel' | 'invite' | null
    const [channelName, setChannelName] = useState('')
    const [channelError, setChannelError] = useState(null)
    const [channelSaving, setChannelSaving] = useState(false)

    useEffect(() => {
        function handlePointerDown(event) {
            if (dialog) {
                return
            }

            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose()
            }
        }

        function handleKeyDown(event) {
            if (event.key === 'Escape' && !dialog) {
                onClose()
            }
        }

        document.addEventListener('mousedown', handlePointerDown)
        document.addEventListener('keydown', handleKeyDown)

        return () => {
            document.removeEventListener('mousedown', handlePointerDown)
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [dialog, onClose])

    async function handleCreateChannel(event) {
        event.preventDefault()
        setChannelSaving(true)
        setChannelError(null)

        const created = await addChannel(channelName)

        setChannelSaving(false)

        if (created) {
            setChannelName('')
            setDialog(null)
            onClose()
        } else {
            setChannelError('Could not create the channel. Check the name and try again.')
        }
    }

    return (
        <>
            <div className='create-more-menu' ref={menuRef} role='menu' aria-label='Create more'>
                <p className='create-more-menu__title'>Create</p>
                <button type='button' className='create-more-menu__item' role='menuitem' onClick={() => setDialog('message')}>
                    New message
                </button>
                <button type='button' className='create-more-menu__item' role='menuitem' onClick={() => { setChannelName(''); setChannelError(null); setDialog('channel') }}>
                    Create channel
                </button>
                <button type='button' className='create-more-menu__item' role='menuitem' onClick={() => setDialog('invite')}>
                    Invite people
                </button>
            </div>

            {dialog === 'message' && <NewMessageDialog onClose={() => { setDialog(null); onClose() }} />}

            {dialog === 'channel' && (
                <div className='workspace-admin-dialog__overlay' onMouseDown={(event) => event.target === event.currentTarget && !channelSaving && setDialog(null)}>
                    <div className='workspace-admin-dialog' role='dialog' aria-modal='true' aria-label='Create channel'>
                        <h2 className='workspace-admin-dialog__title'>Create channel</h2>
                        <form onSubmit={handleCreateChannel}>
                            <label className='workspace-admin-dialog__label' htmlFor='create-channel-name'>Channel name</label>
                            <input
                                id='create-channel-name'
                                className='workspace-admin-dialog__input'
                                value={channelName}
                                onChange={(event) => setChannelName(event.target.value)}
                                placeholder='e.g. marketing'
                                autoFocus
                                disabled={channelSaving}
                            />
                            {channelError && <p className='workspace-admin-dialog__error' role='alert'>{channelError}</p>}
                            <div className='workspace-admin-dialog__actions'>
                                <button type='button' className='workspace-admin-dialog__btn' onClick={() => setDialog(null)} disabled={channelSaving}>Cancel</button>
                                <button type='submit' className='workspace-admin-dialog__btn workspace-admin-dialog__btn--primary' disabled={channelSaving || !channelName.trim()}>
                                    {channelSaving ? 'Creating…' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {dialog === 'invite' && <InvitePeopleDialog onClose={() => { setDialog(null); onClose() }} />}
        </>
    )
}

export default CreateMoreMenu
