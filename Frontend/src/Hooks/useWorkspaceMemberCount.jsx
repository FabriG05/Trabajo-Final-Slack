import useWorkspaceMembers from './useWorkspaceMembers'

/*
    Returns the number of active members of a workspace.
*/
function useWorkspaceMemberCount(workspaceId) {
    const { activeMembers, members_error, members_loading } = useWorkspaceMembers(workspaceId)

    return {
        memberCount: activeMembers.length,
        members_error,
        members_loading
    }
}

export default useWorkspaceMemberCount
