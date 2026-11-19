import mongoose from "mongoose";


const workspaceSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, maxlength: 50, trim: true },
        description: { type: String, required: false, default: '', maxlength: 200, trim: true },
        /*
            Token of the shareable "copy invitation link" URL. Anyone who
            opens the join page with it can become a member of the workspace.
        */
        invite_link_token: { type: String, default: null }
    },
    {
        timestamps: true
    }
)

export const WorkspaceCollection = 'Workspace'
const Workspace = mongoose.model('Workspace', workspaceSchema)

export default Workspace