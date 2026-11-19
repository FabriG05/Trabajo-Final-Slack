import mongoose from "mongoose";
import { WorkspaceCollection } from "./WorkSpaceModel.js";

/*
    Invitations for emails that do not belong to any account yet. The
    MemberModel requires FK_id_user, so while the invitee has no account
    the invitation lives here; when they register with this email and
    open the join link, the membership is created from this document.
*/
const invitationSchema = new mongoose.Schema({
    email: { type: String, required: true, trim: true, lowercase: true },
    FK_id_workspace: { type: mongoose.Schema.Types.ObjectId, required: true, ref: WorkspaceCollection },
    invitation_token: { type: String, default: null },
    invitation_accepted: { type: Boolean, default: false, alias: 'invitationAccepted' },
    invitation_expires_at: { type: Date, default: null, alias: 'invitationExpiresAt' },
    created_at: { type: Date, default: Date.now }
})

invitationSchema.index({ email: 1, FK_id_workspace: 1 })

export const InvitationCollectionName = 'Invitation'
const Invitation = mongoose.model(InvitationCollectionName, invitationSchema)

export default Invitation
