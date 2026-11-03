import Message from "../Models/MessageModel.js";

class MessageRepository {
    async createChannelMessage(workspaceId, channelId, senderId, content) {
        try {
            const message = await Message.create({
                workspace_id: workspaceId,
                channel_id: channelId,
                sender_id: senderId,
                message_type: 'channel',
                content
            });
            return message;
        } catch (error) {
            console.error('Error in MessageRepository.createChannelMessage:', error.message);
            throw error;
        }
    }

    async createDirectMessage(workspaceId, senderId, receiverId, content) {
        try {
            const message = await Message.create({
                workspace_id: workspaceId,
                sender_id: senderId,
                receiver_id: receiverId,
                message_type: 'direct',
                content
            });
            return message;
        } catch (error) {
            console.error('Error in MessageRepository.createDirectMessage:', error.message);
            throw error;
        }
    }

    async getByChannelId(channelId) {
        try {
            const messages = await Message
                .find({ channel_id: channelId, message_type: 'channel' })
                .populate('sender_id', 'name email')
                .sort({ created_at: 1 });
            return messages;
        } catch (error) {
            console.error('Error in MessageRepository.getByChannelId:', error.message);
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
                .populate('sender_id', 'name email')
                .populate('receiver_id', 'name email')
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

