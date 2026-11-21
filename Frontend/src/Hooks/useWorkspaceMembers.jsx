import { useEffect } from 'react'
import useRequest from './useRequest'
import { getWorkspaceMembers } from '../Services/WorkSpaceService'

/*
    Returns the active members of a workspace: memberships where the
    invitation is accepted and the user is still active. Every active
    member is returned regardless of their online status.
*/
function useWorkspaceMembers(workspaceId) {
    const { response, error, loading, sendRequest } = useRequest()

    useEffect(
        () => {
            if (!workspaceId) {
                return
            }

            sendRequest(
                () => getWorkspaceMembers(workspaceId)
            )
        },
        [sendRequest, workspaceId]
    )

    const members = response?.data?.members || []

    const activeMembers = members.filter((member) => {
        const invitationAccepted = member.invitation_accepted ?? member.invitationAccepted
        return Boolean(invitationAccepted) && Boolean(member.FK_id_user?.active)
    })

    return {
        activeMembers,
        members_error: error,
        members_loading: loading
    }
}

export default useWorkspaceMembers
