import mongoose from "mongoose";
import { WorkspaceCollection } from "./WorkSpaceModel.js";
import { UserCollection } from "./UserModel.js";

const channelSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 100 },
        workspace_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: WorkspaceCollection },
        created_by: { type: mongoose.Schema.Types.ObjectId, ref: UserCollection },
        created_at: { type: Date, default: Date.now }
    }
)

channelSchema.index({ workspace_id: 1, name: 1 }, { unique: true })

export const ChannelCollection = 'Channel'
const Channel = mongoose.model(ChannelCollection, channelSchema)

export default Channel

