import ConversationRead from "../Models/ConversationReadModel.js";

class ConversationReadRepository {
    async markRead(workspaceId, userId, conversationKey, conversationType) {
        try {
            // The filter fields are copied into the new document on insert,
            // so the upsert works without an explicit $setOnInsert.
            return await ConversationRead.findOneAndUpdate(
                {
                    workspace_id: workspaceId,
                    user_id: userId,
                    conversation_key: conversationKey
                },
                {
                    $set: {
                        conversation_type: conversationType,
                        last_read_at: new Date()
                    }
                },
                {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true
                }
            );
        } catch (error) {
            console.error('Error in ConversationReadRepository.markRead:', error.message);
            throw error;
        }
    }

    async getByUser(workspaceId, userId) {
        try {
            return await ConversationRead.find({
                workspace_id: workspaceId,
                user_id: userId
            });
        } catch (error) {
            console.error('Error in ConversationReadRepository.getByUser:', error.message);
            throw error;
        }
    }
}

const conversationReadRepository = new ConversationReadRepository();
export default conversationReadRepository;
