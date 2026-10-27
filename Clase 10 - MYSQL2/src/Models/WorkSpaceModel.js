import mongoose from "mongoose";


const workspaceSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, maxlength: 30, trim: true },
        description: { type: String, required: true, maxlength: 200, trim: true }
    },
    {
        timestamps: true
    }
)

export const WorkspaceCollection = 'Workspace'
const Workspace = mongoose.model('Workspace', workspaceSchema)

export default Workspace