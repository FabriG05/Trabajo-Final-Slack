import useRequest from "../Hooks/useRequest"
import { updateProfile } from "../Services/ProfileService"

/*
    Handles the "update profile" action of the onboarding flow
    (name and optional profile photo).
*/
function useUpdateProfile() {
    const { loading, error, sendRequest } = useRequest()

    async function submitUpdateProfile(name, profilePhoto) {
        return await sendRequest(
            () => updateProfile(name, profilePhoto)
        )
    }

    return {
        profile_loading: loading,
        profile_error: error,
        submitUpdateProfile
    }
}

export default useUpdateProfile
