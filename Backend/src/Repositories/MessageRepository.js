import mongoose from "mongoose";
import Message from "../Models/MessageModel.js";

class MessageRepository {
    async createChannelMessage(workspaceId, channelId, senderId, content, attachment = null) {
        try {
            const message = await Message.create({
                workspace_id: workspaceId,
                channel_id: channelId,
                sender_id: senderId,
                message_type: 'channel',
                content,
                attachment
            });
            // The response is rendered directly by the client, so the sender
            // goes populated with the same shape as the message list.
            return await message.populate('sender_id', 'name email profile_photo');
        } catch (error) {
            console.error('Error in MessageRepository.createChannelMessage:', error.message);
            throw error;
        }
    }

    async createDirectMessage(workspaceId, senderId, receiverId, content, attachment = null) {
        try {
            const message = await Message.create({
                workspace_id: workspaceId,
                sender_id: senderId,
                receiver_id: receiverId,
                message_type: 'direct',
                content,
                attachment
            });
            await message.populate('sender_id', 'name email profile_photo');
            await message.populate('receiver_id', 'name email profile_photo');
            return message;
        } catch (error) {
            console.error('Error in MessageRepository.createDirectMessage:', error.message);
            throw error;
        }
    }

    async getById(messageId) {
        try {
            return await Message.findById(messageId);
        } catch (error) {
            console.error('Error in MessageRepository.getById:', error.message);
            throw error;
        }
    }

    async deleteById(messageId) {
        try {
            return await Message.findByIdAndDelete(messageId);
        } catch (error) {
            console.error('Error in MessageRepository.deleteById:', error.message);
            throw error;
        }
    }

    async updateContentById(messageId, content) {
        try {
            return await Message.findByIdAndUpdate(
                messageId,
                { content, edited: true },
                { new: true, runValidators: true }
            )
                .populate('sender_id', 'name email profile_photo')
                .populate('receiver_id', 'name email profile_photo');
        } catch (error) {
            console.error('Error in MessageRepository.updateContentById:', error.message);
            throw error;
        }
    }

    async getByChannelId(channelId) {
        try {
            const messages = await Message
                .find({ channel_id: channelId, message_type: 'channel' })
                .populate('sender_id', 'name email profile_photo')
                .sort({ created_at: 1 });
            return messages;
        } catch (error) {
            console.error('Error in MessageRepository.getByChannelId:', error.message);
            throw error;
        }
    }

    async deleteByChannelId(channelId) {
        try {
            const result = await Message.deleteMany({ channel_id: channelId });
            return result.deletedCount;
        } catch (error) {
            console.error('Error in MessageRepository.deleteByChannelId:', error.message);
            throw error;
        }
    }

    async deleteByWorkspaceId(workspaceId) {
        try {
            const result = await Message.deleteMany({ workspace_id: workspaceId });
            return result.deletedCount;
        } catch (error) {
            console.error('Error in MessageRepository.deleteByWorkspaceId:', error.message);
            throw error;
        }
    }

    /*
        Latest direct message per conversation partner. The DMs screen
        uses it to render previews and dates without loading every
        conversation of the workspace.
    */
    async getDirectMessageSummaries(workspaceId, userId) {
        try {
            const workspaceObjectId = new mongoose.Types.ObjectId(workspaceId)
            const userObjectId = new mongoose.Types.ObjectId(userId)

            return await Message.aggregate([
                {
                    $match: {
                        workspace_id: workspaceObjectId,
                        message_type: 'direct'
                    }
                },
                { $sort: { created_at: -1 } },
                {
                    $group: {
                        _id: {
                            $cond: [
                                { $eq: ['$sender_id', userObjectId] },
                                '$receiver_id',
                                '$sender_id'
                            ]
                        },
                        lastMessage: { $first: '$$ROOT' }
                    }
                },
                { $sort: { 'lastMessage.created_at': -1 } }
            ])
        } catch (error) {
            console.error('Error in MessageRepository.getDirectMessageSummaries:', error.message);
            throw error;
        }
    }

    /*
        Messages received after `since`, used to rebuild unread badges
        when the user loads the workspace.
    */
    async countUnreadChannelMessages(channelId, excludeUserId, since) {
        try {
            return await Message.countDocuments({
                channel_id: channelId,
                message_type: 'channel',
                sender_id: { $ne: excludeUserId },
                created_at: { $gt: since }
            });
        } catch (error) {
            console.error('Error in MessageRepository.countUnreadChannelMessages:', error.message);
            throw error;
        }
    }

    async countUnreadDirectMessages(workspaceId, userId, partnerId, since) {
        try {
            return await Message.countDocuments({
                workspace_id: workspaceId,
                message_type: 'direct',
                sender_id: partnerId,
                receiver_id: userId,
                created_at: { $gt: since }
            });
        } catch (error) {
            console.error('Error in MessageRepository.countUnreadDirectMessages:', error.message);
            throw error;
        }
    }

    /*
        Channel messages that mention a user, newest first. Only the last
        30 days are scanned to keep the Activity feed small.
    */
    async getMentions(workspaceId, excludeUserId, username, limit = 50) {
        try {
            const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            const escapedName = username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

            return await Message.find({
                workspace_id: workspaceId,
                message_type: 'channel',
                sender_id: { $ne: excludeUserId },
                content: { $regex: `@${escapedName}\\b`, $options: 'i' },
                created_at: { $gte: since }
            })
                .populate('sender_id', 'name email profile_photo')
                .populate('channel_id', 'name')
                .sort({ created_at: -1 })
                .limit(limit)
        } catch (error) {
            console.error('Error in MessageRepository.getMentions:', error.message);
            throw error;
        }
    }

    async getDirectMessages(workspaceId, user1Id, user2Id) {
        try {
            const messages = await Message
                .find({
                    workspace_id: workspaceId,
                    message_type: 'direct',
                    $or: [
                        { sender_id: user1Id, receiver_id: user2Id },
                        { sender_id: user2Id, receiver_id: user1Id }
                    ]
                })
                .populate('sender_id', 'name email profile_photo')
                .populate('receiver_id', 'name email profile_photo')
                .sort({ created_at: 1 });
            return messages;
        } catch (error) {
            console.error('Error in MessageRepository.getDirectMessages:', error.message);
            throw error;
        }
    }
}

const messageRepository = new MessageRepository();
export default messageRepository;

