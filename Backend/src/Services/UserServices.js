import user_repository from "../Repositories/UserRepository.js";
import ServerError from "../Utils/Error.Utils.js";

/*
    User service. Holds the business logic of the user endpoints;
    the controllers only extract the data from the HTTP request, hand
    it over here and build the response.
*/
class UserService {
    async getUserList() {
        return await user_repository.get()
    }

    async getUserById(user_id) {
        const user = await user_repository.getById(user_id)

        if (!user) {
            throw new ServerError("User not found", 404)
        }

        return user
    }
}

export default new UserService()
