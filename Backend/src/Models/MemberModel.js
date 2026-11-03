import mongoose from "mongoose";
import { UserCollection } from "./UserModel.js";
import { WorkspaceCollection } from "./WorkSpaceModel.js";

//  Por ahora, vamos a poner FK pero es mala práctica 
const memberSchema = new mongoose.Schema({
    FK_id_user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: UserCollection },
    FK_id_workspace: { type: mongoose.Schema.Types.ObjectId, required: true, ref: WorkspaceCollection },
    role: { type: String, enum: ['User', 'Admin', 'Owner'], default: 'User' },
    invitation_token: { type: String, default: null },
    invitation_accepted: { type: Boolean, default: false, alias: 'invitationAccepted' },
    invitation_expires_at: { type: Date, default: null, alias: 'invitationExpiresAt' },
    created_at: { type: Date, default: Date.now }
})

memberSchema.index({ FK_id_user: 1, FK_id_workspace: 1 }, { unique: true })

export const MemberCollectionName = 'Member'
const Member = mongoose.model(MemberCollectionName, memberSchema)

export default Member
