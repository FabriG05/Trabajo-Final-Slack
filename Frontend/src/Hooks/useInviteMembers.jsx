import useRequest from "../Hooks/useRequest"
import { inviteMembers } from "../Services/WorkSpaceService"

/*
    Handles the "invite teammates" action of the onboarding flow.
    The response carries a summary: which emails were invited,
    which were not found and which were already members.
*/
function useInviteMembers() {
    const { loading, error, sendRequest } = useRequest()

    async function submitInviteMembers(workspaceId, emails) {
        return await sendRequest(
            () => inviteMembers(workspaceId, emails)
        )
    }

    return {
        invitations_loading: loading,
        invitations_error: error,
        submitInviteMembers
    }
}

export default useInviteMembers
