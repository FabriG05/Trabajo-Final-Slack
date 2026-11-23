import React, { useEffect, useRef, useState } from 'react'
import { useWorkspace } from '../../../Context/WorkspaceContext'
import ConfirmDialog from '../../Common/JSX/ConfirmDialog'
import '../CSS/WorkspaceAdminMenu.css'

function getMemberId(member) {
    return String(member?._id || member?.id || '')
}

function getMemberUser(member) {
    return member?.FK_id_user || member?.user || {}
}

function getMemberName(member) {
    const user = getMemberUser(member)
    return user?.name || user?.email || 'Unknown member'
}

function getMemberEmail(member) {
    const user = getMemberUser(member)
    return user?.email || ''
}

function WorkspaceAdminMenu({ onClose }) {
    const {
        workspace,
        workspaceMembers,
        currentUser,
        currentUserRole,
        canManageWorkspace,
        renameWorkspace,
        deleteWorkspace,
        removeWorkspaceMember,
        changeWorkspaceMemberRole,
        refreshMembers
    } = useWorkspace()

    const menuRef = useRef(null)
    const [dialog, setDialog] = useState(null) // 'rename' | 'members' | 'delete' | null
    const [name, setName] = useState(workspace?.name || '')
    const [savingName, setSavingName] = useState(false)
    const [nameError, setNameError] = useState(null)
    const [membersError, setMembersError] = useState(null)
    const [busyMemberId, setBusyMemberId] = useState(null)

    useEffect(() => {
        setName(workspace?.name || '')
    }, [workspace?.name])

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

    async function handleRename(event) {
        event.preventDefault()

        const trimmedName = name.trim()

        if (!trimmedName) {
            setNameError('Workspace name is required.')
            return
        }

        setSavingName(true)
        setNameError(null)

        try {
            await renameWorkspace(trimmedName)
            setDialog(null)
            onClose()
        } catch (error) {
            setNameError(error.message || 'Could not rename the workspace.')
        } finally {
            setSavingName(false)
        }
    }

    async function handleRoleChange(memberId, role) {
        setBusyMemberId(memberId)
        setMembersError(null)

        try {
            await changeWorkspaceMemberRole(memberId, role)
        } catch (error) {
            setMembersError(error.message || 'Could not update the role.')
        } finally {
            setBusyMemberId(null)
        }
    }

    async function handleRemoveMember(memberId) {
        setBusyMemberId(memberId)
        setMembersError(null)

        try {
            await removeWorkspaceMember(memberId)
        } catch (error) {
            setMembersError(error.message || 'Could not remove the member.')
        } finally {
            setBusyMemberId(null)
        }
    }

    const canManage = ['Owner', 'Admin'].includes(currentUserRole)

    if (!canManage) {
        return null
    }

    return (
        <>
            <div className='workspace-admin-menu' ref={menuRef} role='menu' aria-label='Admin settings'>
                <p className='workspace-admin-menu__title'>Admin</p>
                <button
                    type='button'
                    className='workspace-admin-menu__item'
                    role='menuitem'
                    onClick={() => setDialog('rename')}
                >
                    Rename workspace
                </button>
                <button
                    type='button'
                    className='workspace-admin-menu__item'
                    role='menuitem'
                    onClick={async () => {
                        setMembersError(null)
                        await refreshMembers()
                        setDialog('members')
                    }}
                >
                    Manage members & roles
                </button>
                {canManageWorkspace && (
                    <button
                        type='button'
                        className='workspace-admin-menu__item workspace-admin-menu__item--danger'
                        role='menuitem'
                        onClick={() => setDialog('delete')}
                    >
                        Delete workspace
                    </button>
                )}
            </div>

            {dialog === 'rename' && (
                <div className='workspace-admin-dialog__overlay' onMouseDown={(event) => event.target === event.currentTarget && !savingName && setDialog(null)}>
                    <div className='workspace-admin-dialog' role='dialog' aria-modal='true' aria-label='Rename workspace'>
                        <h2 className='workspace-admin-dialog__title'>Rename workspace</h2>
                        <form onSubmit={handleRename}>
                            <label className='workspace-admin-dialog__label' htmlFor='rename-workspace-name'>Workspace name</label>
                            <input
                                id='rename-workspace-name'
                                className='workspace-admin-dialog__input'
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                maxLength={80}
                                disabled={savingName}
                                autoFocus
                            />
                            {nameError && <p className='workspace-admin-dialog__error' role='alert'>{nameError}</p>}
                            <div className='workspace-admin-dialog__actions'>
                                <button type='button' className='workspace-admin-dialog__btn' onClick={() => setDialog(null)} disabled={savingName}>Cancel</button>
                                <button type='submit' className='workspace-admin-dialog__btn workspace-admin-dialog__btn--primary' disabled={savingName || !name.trim()}>
                                    {savingName ? 'Saving…' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {dialog === 'members' && (
                <div className='workspace-admin-dialog__overlay' onMouseDown={(event) => event.target === event.currentTarget && !busyMemberId && setDialog(null)}>
                    <div className='workspace-admin-dialog workspace-admin-dialog--wide' role='dialog' aria-modal='true' aria-label='Manage members and roles'>
                        <h2 className='workspace-admin-dialog__title'>Manage members & roles</h2>
                        <p className='workspace-admin-dialog__subtitle'>Owners/Admins can remove members and change roles. The owner cannot be changed.</p>
                        {membersError && <p className='workspace-admin-dialog__error' role='alert'>{membersError}</p>}
                        <ul className='workspace-admin-members'>
                            {workspaceMembers.map((member) => {
                                const memberId = getMemberId(member)
                                const user = getMemberUser(member)
                                const isOwner = member.role === 'Owner'
                                const isSelf = String(user?._id || '') === String(currentUser.id)
                                const busy = busyMemberId === memberId

                                return (
                                    <li key={memberId} className='workspace-admin-members__item'>
                                        <div className='workspace-admin-members__info'>
                                            <span className='workspace-admin-members__name'>
                                                {getMemberName(member)}
                                                {isSelf ? ' (you)' : ''}
                                            </span>
                                            <span className='workspace-admin-members__email'>{getMemberEmail(member)}</span>
                                        </div>
                                        <div className='workspace-admin-members__controls'>
                                            <select
                                                className='workspace-admin-members__role'
                                                value={member.role}
                                                disabled={isOwner || busy}
                                                onChange={(event) => handleRoleChange(memberId, event.target.value)}
                                                aria-label={`Role for ${getMemberName(member)}`}
                                            >
                                                <option value='Owner'>Owner</option>
                                                <option value='Admin'>Admin</option>
                                                <option value='User'>User</option>
                                            </select>
                                            {!isOwner && (
                                                <button
                                                    type='button'
                                                    className='workspace-admin-members__remove'
                                                    disabled={busy}
                                                    onClick={() => handleRemoveMember(memberId)}
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>
                        <div className='workspace-admin-dialog__actions'>
                            <button type='button' className='workspace-admin-dialog__btn workspace-admin-dialog__btn--primary' onClick={() => setDialog(null)} disabled={Boolean(busyMemberId)}>Done</button>
                        </div>
                    </div>
                </div>
            )}

            {dialog === 'delete' && canManageWorkspace && (
                <ConfirmDialog
                    title={`Delete ${workspace?.name || 'this workspace'}?`}
                    description='This permanently deletes the workspace, its channels, messages and memberships. This action cannot be undone.'
                    confirmLabel='Delete workspace'
                    requireText={workspace?.name || ''}
                    onCancel={() => setDialog(null)}
                    onConfirm={async () => {
                        await deleteWorkspace()
                    }}
                />
            )}
        </>
    )
}

export default WorkspaceAdminMenu
