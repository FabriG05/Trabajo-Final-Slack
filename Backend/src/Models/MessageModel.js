import mongoose from "mongoose";
import { ChannelCollection } from "./ChannelModel.js";
import { UserCollection } from "./UserModel.js";
import { WorkspaceCollection } from "./WorkSpaceModel.js";

const messageSchema = new mongoose.Schema(
    {
        workspace_id: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: WorkspaceCollection,
            required: true 
        },
        sender_id: { 
            type: mongoose.Schema.Types.ObjectId, 
            required: true, 
            ref: UserCollection 
        },
        message_type: { 
            type: String, 
            enum: ['channel', 'direct'], 
            required: true, 
            default: 'channel' 
        },
        channel_id: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: ChannelCollection,
            default: null 
        },
        receiver_id: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: UserCollection,
            default: null 
        },
        content: { 
            type: String, 
            required: true, 
            trim: true 
        },
        edited: { 
            type: Boolean, 
            default: false 
        },
        created_at: { 
            type: Date, 
            default: Date.now 
        }
    }
)

messageSchema.index({ channel_id: 1, created_at: 1 })
messageSchema.index({ workspace_id: 1, message_type: 1, created_at: 1 })
messageSchema.index({ sender_id: 1, receiver_id: 1, created_at: 1 })

export const MessageCollection = 'Message'
const Message = mongoose.model(MessageCollection, messageSchema)

export default Message
