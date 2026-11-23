import React, { useState } from 'react'
import { useWorkspace } from '../../../Context/WorkspaceContext'
import '../CSS/WorkspaceAdminMenu.css'
import '../CSS/CreateMoreMenu.css'

function getInitials(name) {
    return (name || '?').slice(0, 2).toUpperCase()
}

function NewMessageDialog({ onClose }) {
    const { directMessages, selectDm, setActiveNavTab } = useWorkspace()
    const [query, setQuery] = useState('')

    const filteredMembers = directMessages.filter((dm) => {
        if (!query.trim()) {
            return true
        }

        return dm.username.toLowerCase().includes(query.trim().toLowerCase())
    })

    return (
        <div className='workspace-admin-dialog__overlay' onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
            <div className='workspace-admin-dialog' role='dialog' aria-modal='true' aria-label='New message'>
                <h2 className='workspace-admin-dialog__title'>New message</h2>
                <input
                    className='workspace-admin-dialog__input'
                    placeholder='Search for a person'
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    autoFocus
                />
                <ul className='create-more-menu__people'>
                    {filteredMembers.map((dm) => (
                        <li key={dm.id}>
                            <button
                                type='button'
                                className='create-more-menu__person'
                                onClick={() => {
                                    selectDm(dm.id)
                                    setActiveNavTab('home')
                                    onClose()
                                }}
                            >
                                <span className='create-more-menu__person-avatar'>{getInitials(dm.username)}</span>
                                <span className='create-more-menu__person-name'>
                                    {dm.username}
                                    {dm.isSelf ? ' (you)' : ''}
                                </span>
                            </button>
                        </li>
                    ))}
                    {filteredMembers.length === 0 && (
                        <li className='create-more-menu__empty'>No people found.</li>
                    )}
                </ul>
                <div className='workspace-admin-dialog__actions'>
                    <button type='button' className='workspace-admin-dialog__btn' onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    )
}

export default NewMessageDialog
