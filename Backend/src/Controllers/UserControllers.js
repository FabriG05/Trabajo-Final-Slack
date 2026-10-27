import userRepository from "../Repositories/UserRepository.js"
import ServerError from "../Utils/Error.Utils.js"


export async function getUsers(request, response) {
    const userList = await userRepository.get()
    response.status(200).send({
        message: "Get users list",
        ok: true,
        data: {
            users: userList
        }
    })
}

export async function getUserById(request, response) {
    const userId = request.params.user_id
    const user = await userRepository.getById(userId)

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