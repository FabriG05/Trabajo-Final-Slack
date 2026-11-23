import starredMessageRepository from "../Repositories/StarredMessageRepository.js";
import messageRepository from "../Repositories/MessageRepository.js";
import ServerError from "../Utils/Error.Utils.js";

class StarredMessageService {
    async getStarredMessages(workspaceId, userId) {
        const starred = await starredMessageRepository.getByUserAndWorkspace(userId, workspaceId);
        return starred.filter((item) => item.message_id);
    }

    async getStarredMessageIds(workspaceId, userId) {
        return await starredMessageRepository.getIdsByUserAndWorkspace(userId, workspaceId);
    }

    async starMessage(workspaceId, userId, messageId) {
        const message = await messageRepository.getById(messageId);

        if (!message || String(message.workspace_id) !== String(workspaceId)) {
            throw new ServerError("Message not found.", 404);
        }

        await starredMessageRepository.create(userId, workspaceId, messageId);
        return { messageId: String(message._id) };
    }

    async unstarMessage(workspaceId, userId, messageId) {
        await starredMessageRepository.delete(userId, messageId);
        return { messageId: String(messageId) };
    }
}

export default new StarredMessageService();
