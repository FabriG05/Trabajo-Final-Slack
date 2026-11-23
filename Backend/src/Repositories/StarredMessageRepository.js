import StarredMessage from "../Models/StarredMessageModel.js";

class StarredMessageRepository {
    async getByUserAndWorkspace(userId, workspaceId) {
        return await StarredMessage
            .find({ user_id: userId, workspace_id: workspaceId })
            .populate({
                path: 'message_id',
                populate: [
                    { path: 'sender_id', select: 'name email profile_photo' },
                    { path: 'channel_id', select: 'name' },
                    { path: 'receiver_id', select: 'name email' }
                ]
            })
            .sort({ created_at: -1 });
    }

    async getIdsByUserAndWorkspace(userId, workspaceId) {
        const rows = await StarredMessage.find(
            { user_id: userId, workspace_id: workspaceId },
            { message_id: 1 }
        );
        return rows.map((row) => String(row.message_id));
    }

    async create(userId, workspaceId, messageId) {
        return await StarredMessage.findOneAndUpdate(
            { user_id: userId, message_id: messageId },
            { $setOnInsert: { user_id: userId, workspace_id: workspaceId, message_id: messageId } },
            { upsert: true, new: true }
        );
    }

    async delete(userId, messageId) {
        return await StarredMessage.findOneAndDelete({ user_id: userId, message_id: messageId });
    }
}

export default new StarredMessageRepository();
