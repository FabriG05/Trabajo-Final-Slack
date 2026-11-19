import Invitation from "../Models/InvitationModel.js";

class InvitationRepository {
    async create(email, FK_id_workspace, invitationToken, invitationExpiresAt) {
        try {
            const createdInvitation = await Invitation.create({
                email,
                FK_id_workspace,
                invitation_token: invitationToken,
                invitation_expires_at: invitationExpiresAt
            });
            console.log('Invitation created successfully DB:', createdInvitation);
            return createdInvitation;
        } catch (error) {
            console.error('Error in InvitationRepository:', error.message);
            throw error;
        }
    }

    async getByWorkspaceAndInvitationToken(workspaceId, invitationToken) {
        try {
            return await Invitation.findOne({
                FK_id_workspace: workspaceId,
                invitation_token: invitationToken
            });
        } catch (error) {
            console.error('Error in InvitationRepository:', error.message);
            throw error;
        }
    }

    async getPendingByEmailAndWorkspace(email, workspaceId) {
        try {
            return await Invitation.findOne({
                email: email,
                FK_id_workspace: workspaceId,
                invitation_accepted: false
            });
        } catch (error) {
            console.error('Error in InvitationRepository:', error.message);
            throw error;
        }
    }

    async acceptById(invitationId) {
        try {
            return await Invitation.findByIdAndUpdate(
                invitationId,
                {
                    invitation_accepted: true,
                    invitation_token: null
                },
                { new: true }
            );
        } catch (error) {
            console.error('Error in InvitationRepository:', error.message);
            throw error;
        }
    }
}

const Invitation_Repository = new InvitationRepository()

export default Invitation_Repository
