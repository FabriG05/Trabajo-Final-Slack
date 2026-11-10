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
