import memberRepository from "../Repositories/MemberRepository.js"
import { publishUserProfileChanged, publishUserStatusChanged } from "../Realtime/SocketServer.js"
import user_service from "../Services/UserServices.js"

/*
    User controllers. Thin HTTP layer: each handler only reads the data
    out of the request, hands it to the user service (which owns the
    business logic) and builds the response.
*/
export async function getCurrentUser(request, response) {
    const user = await user_service.getCurrentUser(request.user.id)

    return response.status(200).send(
        {
            message: "Current user retrieved successfully",
            ok: true,
            data: {
                user
            }
        }
    )
}

export async function updateProfile(request, response) {
    const { name, profile_photo } = request.body

    const updatedUser = await user_service.updateProfile(
        request.user.id,
        name,
        profile_photo
    )

    try {
        const memberships = await memberRepository.getAllWorkspacesByUserId(request.user.id)
        const workspaceIds = memberships
            .map((membership) => membership.FK_id_workspace?._id || membership.FK_id_workspace)
            .filter(Boolean)

        publishUserProfileChanged(workspaceIds, request.user.id, {
            name: updatedUser?.name,
            profile_photo: updatedUser?.profile_photo ?? null
        })
    } catch (error) {
        console.error("Could not publish user profile change:", error.message)
    }

    return response.status(200).send(
        {
            message: "Profile updated successfully",
            ok: true,
            data: {
                user: updatedUser
            }
        }
    )
}

export async function updateStatus(request, response) {
    const { status } = request.body

    const user = await user_service.updateStatus(request.user.id, status)

    try {
        const memberships = await memberRepository.getAllWorkspacesByUserId(request.user.id)
        const workspaceIds = memberships
            .map((membership) => membership.FK_id_workspace?._id || membership.FK_id_workspace)
            .filter(Boolean)

        publishUserStatusChanged(workspaceIds, request.user.id, user.status || status)
    } catch (error) {
        console.error("Could not publish user status change:", error.message)
    }

    return response.status(200).send(
        {
            message: "Status updated successfully",
            ok: true,
            data: {
                user
            }
        }
    )
}

