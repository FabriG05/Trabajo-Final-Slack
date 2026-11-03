import user_repository from "../Repositories/UserRepository.js"
import ServerError from "../Utils/Error.Utils.js"


export async function getUsers(request, response) {
    const user_list = await user_repository.get()
    response.status(200).send({
        message: "Get users list",
        ok: true,
        data: {
            users: user_list
        }
    })
}

export async function getUserById(request, response) {
    const user_id = request.params.user_id
    const user = await user_repository.getById(user_id)

    if (!user) {
        throw new ServerError("User not found", 404)
    }
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