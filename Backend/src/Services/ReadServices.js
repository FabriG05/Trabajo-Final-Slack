import conversationReadRepository from "../Repositories/ConversationReadRepository.js";
import channelRepository from "../Repositories/ChannelRepository.js";
import memberRepository from "../Repositories/MemberRepository.js";
import messageRepository from "../Repositories/MessageRepository.js";
import ServerError from "../Utils/Error.Utils.js";

const CONVERSATION_TYPES = ['channel', 'direct']

class ReadService {
    async markConversationRead(workspaceId, userId, conversationKey, conversationType) {
        if (!CONVERSATION_TYPES.includes(conversationType)) {
            throw new ServerError("Conversation type must be 'channel' or 'direct'.", 400)
        }

        if (!conversationKey) {
            throw new ServerError("Conversation key is required.", 400)
        }

        return await conversationReadRepository.markRead(
            workspaceId,
            userId,
            conversationKey,
            conversationType
        )
    }

    /*
        Map of conversation key -> last read date. Conversations without a
        record use the membership date as the starting point, so a new
        member does not see the whole history as unread.
    */
    async getReadMap(workspaceId, userId) {
        const reads = await conversationReadRepository.getByUser(workspaceId, userId)

        return reads.reduce((accumulator, read) => {
            accumulator[read.conversation_key] = read.last_read_at
            return accumulator
        }, {})
    }

    async getUnreadCounts(workspaceId, userId, membershipCreatedAt) {
        const [readMap, channels, members] = await Promise.all([
            this.getReadMap(workspaceId, userId),
            channelRepository.getByWorkspaceId(workspaceId),
            memberRepository.getAllMembershipsByWorkspaceId(workspaceId)
        ])

        const fallbackSince = membershipCreatedAt
            ? new Date(membershipCreatedAt)
            : new Date(0)

        const channelCounts = await Promise.all(
            channels.map(async (channel) => {
                const key = String(channel._id)
                const since = readMap[key] || fallbackSince
                const count = await messageRepository.countUnreadChannelMessages(
                    channel._id,
                    userId,
                    since
                )

                return [key, count]
            })
        )

        const dmPartners = members.filter((member) => {
            const memberUserId = member.FK_id_user?._id
            const invitationAccepted = member.invitation_accepted ?? member.invitationAccepted

            return Boolean(memberUserId)
                && String(memberUserId) !== String(userId)
                && Boolean(invitationAccepted)
                && Boolean(member.FK_id_user?.active)
        })

        const dmCounts = await Promise.all(
            dmPartners.map(async (member) => {
                const key = String(member.FK_id_user._id)
                const since = readMap[key] || fallbackSince
                const count = await messageRepository.countUnreadDirectMessages(
                    workspaceId,
                    userId,
                    member.FK_id_user._id,
                    since
                )

                return [key, count]
            })
        )

        return Object.fromEntries(
            [...channelCounts, ...dmCounts].filter(([, count]) => count > 0)
        )
    }
}

export default new ReadService()
