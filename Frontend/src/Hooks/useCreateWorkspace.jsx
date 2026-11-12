import { useState } from "react"
import useRequest from "../Hooks/useRequest"
import { createWorkspace } from "../Services/WorkSpaceService"

/*
    Handles the "create workspace" action and lets the caller
    refresh the workspace list once the creation succeeds.
*/
function useCreateWorkspace(onCreated) {
    const { loading, error, sendRequest } = useRequest()
    const [createdWorkspace, setCreatedWorkspace] = useState(null)

    async function submitCreateWorkspace(name, description) {
        const response = await sendRequest(
            () => createWorkspace(name, description)
        )

        if (response) {
            setCreatedWorkspace(response)
            if (onCreated) {
                onCreated(response)
            }
        }

        return response
    }

    return {
        create_loading: loading,
        create_error: error,
        createdWorkspace,
        submitCreateWorkspace
    }
}

export default useCreateWorkspace
