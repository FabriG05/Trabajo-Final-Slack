import messageRepository from "../Repositories/MessageRepository.js";
import memberRepository from "../Repositories/MemberRepository.js";
import userRepository from "../Repositories/UserRepository.js";
import channelService from "./ChannelServices.js";
import ServerError from "../Utils/Error.Utils.js";

/*
    Message service. Validates the content and the conversation the
    message belongs to (channel or direct message) before hitting the
    repository. Direct messages can only flow between active members
    of the same workspace.
*/

const MAX_MESSAGE_LENGTH = 4000

class MessageService {
    normalizeContent(content) {
        if (typeof content !== 'string') {
            throw new ServerError("Message content is required.", 400)
        }

        const normalizedContent = content.trim()

        if (!normalizedContent) {
            throw new ServerError("Message content is required.", 400)
        }

        if (normalizedContent.length > MAX_MESSAGE_LENGTH) {
            throw new ServerError(
                `Message content cannot be longer than ${MAX_MESSAGE_LENGTH} characters.`,
                400
            )
        }

        return normalizedContent
    }

    async getChannelMessages(workspaceId, channelId) {
        // Throws 404 when the channel does not belong to this workspace.
        await channelService.getChannelById(workspaceId, channelId)

        return await messageRepository.getByChannelId(channelId)
    }

    async createChannelMessage(workspaceId, channelId, senderId, content) {
        // Throws 404 when the channel does not belong to this workspace.
        await channelService.getChannelById(workspaceId, channelId)

        return await messageRepository.createChannelMessage(
            workspaceId,
            channelId,
            senderId,
            this.normalizeContent(content)
        )
    }

    async getDirectMessages(workspaceId, userId, otherUserId) {
        await this.validateDirectMessageTarget(workspaceId, otherUserId)

        return await messageRepository.getDirectMessages(workspaceId, userId, otherUserId)
    }

    async createDirectMessage(workspaceId, senderId, otherUserId, content) {
        await this.validateDirectMessageTarget(workspaceId, otherUserId)

        return await messageRepository.createDirectMessage(
            workspaceId,
            senderId,
            otherUserId,
            this.normalizeContent(content)
        )
    }

    async validateDirectMessageTarget(workspaceId, otherUserId) {
        // The other side of the conversation must be an active member of
        // this workspace, otherwise the DM would be unreachable for them.
        const membership =
            await memberRepository.getMembershipByUserAndWorkspace(otherUserId, workspaceId)

        if (!membership || !membership.invitation_accepted) {
            throw new ServerError("User is not a member of this workspace.", 404)
        }

        const user = await userRepository.getById(otherUserId)

        if (!user || !user.active) {
            throw new ServerError("User is not active.", 404)
        }
    }
}

export default new MessageService()
