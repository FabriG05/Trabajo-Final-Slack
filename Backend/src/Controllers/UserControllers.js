import user_service from "../Services/UserServices.js"

/*
    User controllers. Thin HTTP layer: each handler only reads the data
    out of the request, hands it to the user service (which owns the
    business logic) and builds the response.
*/
export async function getUsers(request, response) {
    const user_list = await user_service.getUserList()

    return response.status(200).send(
        {
            message: "Get users list",
            ok: true,
            data: {
                users: user_list
            }
        }
    )
}

export async function getUserById(request, response) {
    const user = await user_service.getUserById(request.params.user_id)

    return response.status(200).send(
        {
            message: "Get user details successfully",
            ok: true,
            data: {
                user: user
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

