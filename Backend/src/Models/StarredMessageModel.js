import mongoose from "mongoose";
import { MessageCollection } from "./MessageModel.js";
import { UserCollection } from "./UserModel.js";
import { WorkspaceCollection } from "./WorkSpaceModel.js";

const starredMessageSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: UserCollection,
            required: true
        },
        workspace_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: WorkspaceCollection,
            required: true
        },
        message_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: MessageCollection,
            required: true
        },
        created_at: {
            type: Date,
            default: Date.now
        }
    }
)

starredMessageSchema.index({ user_id: 1, message_id: 1 }, { unique: true })
starredMessageSchema.index({ user_id: 1, workspace_id: 1, created_at: -1 })

export const StarredMessageCollection = 'StarredMessage'
const StarredMessage = mongoose.model(StarredMessageCollection, starredMessageSchema)

export default StarredMessage
