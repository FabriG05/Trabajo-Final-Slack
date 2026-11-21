import user_repository from "../Repositories/UserRepository.js";
import ServerError from "../Utils/Error.Utils.js";

/*
    User service. Holds the business logic of the user endpoints;
    the controllers only extract the data from the HTTP request, hand
    it over here and build the response.
*/
class UserService {
    // The client compresses the photo to a small JPEG before sending
    // it, so anything beyond this points at a bypass of that step.
    // 500 KB of base64 covers the ~256px JPEG with plenty of margin.
    static MAX_PROFILE_PHOTO_LENGTH = 500 * 1024

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

    async updateProfile(user_id, name, profile_photo) {
        const updateData = {}

        if (name !== undefined) {
            const trimmedName = typeof name === 'string' ? name.trim() : ''

            if (!trimmedName) {
                throw new ServerError("Name cannot be empty.", 400)
            }

            updateData.name = trimmedName
        }

        if (profile_photo !== undefined) {
            if (profile_photo !== null && typeof profile_photo !== 'string') {
                throw new ServerError("Profile photo must be a base64 string.", 400)
            }

            if (
                profile_photo !== null &&
                profile_photo.length > UserService.MAX_PROFILE_PHOTO_LENGTH
            ) {
                throw new ServerError("Profile photo is too large.", 413)
            }

            updateData.profile_photo = profile_photo
        }

        const updatedUser = await user_repository.updateById(user_id, updateData)

        if (!updatedUser) {
            throw new ServerError("User not found", 404)
        }

        return updatedUser
    }

    async updateStatus(user_id, status) {
        const validStatuses = ['online', 'away', 'offline', 'do not disturb']

        if (!validStatuses.includes(status)) {
            throw new ServerError("Status must be online, away, offline or do not disturb.", 400)
        }

        const updatedUser = await user_repository.updateById(user_id, { status })

        if (!updatedUser) {
            throw new ServerError("User not found", 404)
        }

        return updatedUser
    }
}

export default new UserService()
