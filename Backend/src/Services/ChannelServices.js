import channelRepository from "../Repositories/ChannelRepository.js";
import messageRepository from "../Repositories/MessageRepository.js";
import ServerError from "../Utils/Error.Utils.js";

/*
    Channel service. Holds the business logic of the channel endpoints:
    name normalization, duplicate detection and ownership checks. The
    controllers only read the request and build the response.
*/

const MAX_CHANNEL_NAME_LENGTH = 100
const CHANNEL_NAME_REGEX = /^[a-z0-9_-]+$/

class ChannelService {
    normalizeName(name) {
        if (typeof name !== 'string') {
            throw new ServerError("Channel name is required.", 400)
        }

        const normalizedName = name.trim().toLowerCase().replace(/\s+/g, '-')

        if (!normalizedName) {
            throw new ServerError("Channel name is required.", 400)
        }

        if (normalizedName.length > MAX_CHANNEL_NAME_LENGTH) {
            throw new ServerError(
                `Channel name cannot be longer than ${MAX_CHANNEL_NAME_LENGTH} characters.`,
                400
            )
        }

        if (!CHANNEL_NAME_REGEX.test(normalizedName)) {
            throw new ServerError(
                "Channel name can only contain letters, numbers, hyphens and underscores.",
                400
            )
        }

        return normalizedName
    }

    async createChannel(workspaceId, name, createdBy) {
        const normalizedName = this.normalizeName(name)

        const existingChannel =
            await channelRepository.getByWorkspaceAndName(workspaceId, normalizedName)

        if (existingChannel) {
            throw new ServerError(
                "A channel with that name already exists in this workspace.",
                409
            )
        }

        try {
            return await channelRepository.create(workspaceId, normalizedName, createdBy)
        } catch (error) {
            // The unique index is the last line of defense against two
            // simultaneous requests creating the same channel.
            if (error.code === 11000) {
                throw new ServerError(
                    "A channel with that name already exists in this workspace.",
                    409
                )
            }

            throw error
        }
    }

    async getChannels(workspaceId) {
        return await channelRepository.getByWorkspaceId(workspaceId)
    }

    async getChannelById(workspaceId, channelId) {
        const channel = await channelRepository.getById(channelId)

        if (!channel || String(channel.workspace_id) !== String(workspaceId)) {
            throw new ServerError("Channel not found.", 404)
        }

        return channel
    }

    async deleteChannel(workspaceId, channelId) {
        const channel = await this.getChannelById(workspaceId, channelId)

        // #general is the fallback conversation of the workspace: deleting it
        // would leave the workspace without its default channel.
        if (channel.name === 'general') {
            throw new ServerError("The #general channel cannot be deleted.", 400)
        }

        // Cascade: a deleted channel takes its messages with it.
        await messageRepository.deleteByChannelId(channelId)
        await channelRepository.deleteById(channelId)

        return channel
    }
}

export default new ChannelService()
