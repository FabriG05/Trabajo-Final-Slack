import mongoose from "mongoose";
import { UserCollection } from "./UserModel.js";
import { WorkspaceCollection } from "./WorkSpaceModel.js";

//  Por ahora, vamos a poner FK pero es mala práctica 
const memberSchema = new mongoose.Schema({
    FK_id_user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: UserCollection },
    FK_id_workspace: { type: mongoose.Schema.Types.ObjectId, required: true, ref: WorkspaceCollection },
    role: { type: String, enum: ['User', 'Admin', 'Owner'], default: 'User' },
    created_at: { type: Date, default: Date.now }
})

export const MemberCollectionName = 'Member'
const Member = mongoose.model(MemberCollectionName, memberSchema)

export default Member