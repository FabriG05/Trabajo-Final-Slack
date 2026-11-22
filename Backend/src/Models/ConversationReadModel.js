import mongoose from "mongoose";
import { UserCollection } from "./UserModel.js";
import { WorkspaceCollection } from "./WorkSpaceModel.js";

/*
    Last time a user read a conversation (a channel or a direct message).
    `conversation_key` is the channel id or the id of the other member.
*/
const conversationReadSchema = new mongoose.Schema({
    workspace_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: WorkspaceCollection
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: UserCollection
    },
    conversation_key: {
        type: String,
        required: true
    },
    conversation_type: {
        type: String,
        enum: ['channel', 'direct'],
        required: true
    },
    last_read_at: {
        type: Date,
        default: Date.now
    }
})

conversationReadSchema.index(
    { workspace_id: 1, user_id: 1, conversation_key: 1 },
    { unique: true }
)

export const ConversationReadCollection = 'ConversationRead'
const ConversationRead = mongoose.model(ConversationReadCollection, conversationReadSchema)

export default ConversationRead
