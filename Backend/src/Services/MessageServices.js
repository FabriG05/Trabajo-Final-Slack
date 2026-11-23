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
const MAX_ATTACHMENT_SIZE_BYTES = 2 * 1024 * 1024
const MAX_ATTACHMENT_DATA_LENGTH = 4 * 1024 * 1024
const ALLOWED_ATTACHMENT_MIME_TYPES = new Set([
    'application/pdf',
    'image/gif',
    'image/jpeg',
    'image/png',
    'image/webp'
])

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

    normalizeAttachment(attachment) {
        if (attachment === undefined || attachment === null) {
            return null
        }

        if (typeof attachment !== 'object' || Array.isArray(attachment)) {
            throw new ServerError("Attachment is invalid.", 400)
        }

        const name = typeof attachment.name === 'string' ? attachment.name.trim() : ''
        const mimeType = typeof attachment.mimeType === 'string' ? attachment.mimeType.trim().toLowerCase() : ''
        const data = typeof attachment.data === 'string' ? attachment.data : ''
        const size = Number(attachment.size)

        if (!name || !mimeType || !data || !Number.isFinite(size) || size <= 0) {
            throw new ServerError("Attachment is invalid.", 400)
        }

        if (!ALLOWED_ATTACHMENT_MIME_TYPES.has(mimeType) && !mimeType.startsWith('image/')) {
            throw new ServerError("Only images and PDF files are allowed.", 400)
        }

        if (mimeType.startsWith('image/') && !ALLOWED_ATTACHMENT_MIME_TYPES.has(mimeType)) {
            throw new ServerError("Only GIF, JPEG, PNG, WEBP images and PDF files are allowed.", 400)
        }

        if (size > MAX_ATTACHMENT_SIZE_BYTES) {
            throw new ServerError("Attachment is too large. Maximum size is 2MB.", 413)
        }

        if (data.length > MAX_ATTACHMENT_DATA_LENGTH) {
            throw new ServerError("Attachment is too large.", 413)
        }

        const expectedPrefix = `data:${mimeType};base64,`
        if (!data.startsWith(expectedPrefix)) {
            throw new ServerError("Attachment data is invalid.", 400)
        }

        return {
            data,
            name: name.slice(0, 255),
            mimeType,
            size: Math.round(size)
        }
    }

    normalizeMessagePayload(content, attachment) {
        const normalizedAttachment = this.normalizeAttachment(attachment)
        const hasAttachment = Boolean(normalizedAttachment)

        if (typeof content !== 'string') {
            if (hasAttachment) {
                return { content: '', attachment: normalizedAttachment }
            }
            throw new ServerError("Message content is required.", 400)
        }

        const normalizedContent = content.trim()

        if (!normalizedContent && !hasAttachment) {
            throw new ServerError("Message content or attachment is required.", 400)
        }

        if (normalizedContent.length > MAX_MESSAGE_LENGTH) {
            throw new ServerError(
                `Message content cannot be longer than ${MAX_MESSAGE_LENGTH} characters.`,
                400
            )
        }

        return {
            content: normalizedContent,
            attachment: normalizedAttachment
        }
    }

    async getChannelMessages(workspaceId, channelId) {
        // Throws 404 when the channel does not belong to this workspace.
        await channelService.getChannelById(workspaceId, channelId)

        return await messageRepository.getByChannelId(channelId)
    }

    async createChannelMessage(workspaceId, channelId, senderId, content, attachment) {
        // Throws 404 when the channel does not belong to this workspace.
        await channelService.getChannelById(workspaceId, channelId)

        const normalizedMessage = this.normalizeMessagePayload(content, attachment)

        return await messageRepository.createChannelMessage(
            workspaceId,
            channelId,
            senderId,
            normalizedMessage.content,
            normalizedMessage.attachment
        )
    }

    async getDirectMessageSummaries(workspaceId, userId) {
        return await messageRepository.getDirectMessageSummaries(workspaceId, userId)
    }

    async getMentions(workspaceId, userId, username) {
        if (!username) {
            return []
        }

        return await messageRepository.getMentions(workspaceId, userId, username)
    }

    async getDirectMessages(workspaceId, userId, otherUserId) {
        await this.validateDirectMessageTarget(workspaceId, otherUserId)

        return await messageRepository.getDirectMessages(workspaceId, userId, otherUserId)
    }

    async createDirectMessage(workspaceId, senderId, otherUserId, content, attachment) {
        await this.validateDirectMessageTarget(workspaceId, otherUserId)

        const normalizedMessage = this.normalizeMessagePayload(content, attachment)

        return await messageRepository.createDirectMessage(
            workspaceId,
            senderId,
            otherUserId,
            normalizedMessage.content,
            normalizedMessage.attachment
        )
    }

    /*
        Deletes a single message of a channel or a direct conversation.
        The author can always delete their own message; owners and admins
        can delete any message of the workspace.
    */
    async deleteMessage(workspaceId, messageId, requesterId, requesterRole) {
        const message = await messageRepository.getById(messageId)

        if (!message || String(message.workspace_id) !== String(workspaceId)) {
            throw new ServerError("Message not found.", 404)
        }

        const isAuthor = String(message.sender_id) === String(requesterId)
        const canModerate = ['Owner', 'Admin'].includes(requesterRole)

        if (!isAuthor && !canModerate) {
            throw new ServerError(
                "You do not have enough permissions to delete this message.",
                403
            )
        }

        const deletedMessage = await messageRepository.deleteById(messageId)

        return deletedMessage ?? message
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
