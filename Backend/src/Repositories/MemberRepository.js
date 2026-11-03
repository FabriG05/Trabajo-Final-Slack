import Member from "../Models/MemberModel.js";

class MemberRepository {
    async create(FK_id_user, FK_id_workspace, role, extraData = {}) {
        try {
            const createdMember = await Member.create({
                FK_id_user,
                FK_id_workspace,
                role,
                ...extraData
            });
            console.log('Member created successfully DB:', createdMember);
            return createdMember;
        } catch (error) {
            console.error('Error in MemberRepository:', error.message);
            throw error;
        }
    }

    async deleteById(member_id) {
        try {
            const deletedMember = await Member.findByIdAndDelete(member_id);
            console.log('Member deleted successfully from DB:', deletedMember);
            return deletedMember;
        } catch (error) {
            console.error('Error in MemberRepository:', error.message);
            throw error;
        }
    }

    async delteById(member_id) {
        return await this.deleteById(member_id);
    }

    async updateRoleById(member_id, role) {
        try {
            const updatedMember = await Member.findByIdAndUpdate(
                member_id,
                { role },
                { new: true, runValidators: true }
            );
            console.log('Role updated successfully in DB:', updatedMember);
            return updatedMember;
        } catch (error) {
            console.error('Error in MemberRepository:', error.message);
            throw error;
        }
    }

    async getAllWorkspacesByUserId(userId) {
        try {
            const result = await Member
                .find({ FK_id_user: userId })
                .populate(
                    'FK_id_workspace',
                    'name created_at description'
                );
            console.log(result);
            return result;
        } catch (error) {
            console.error('Error in MemberRepository:', error.message);
            throw error;
        }
    }

    async getAllWorkspaceByUserId(userId) {
        return await this.getAllWorkspacesByUserId(userId);
    }

    async getAllMembershipsByWorkspaceId(workspaceId) {
        try {
            const result = await Member
                .find({ FK_id_workspace: workspaceId })
                .populate(
                    'FK_id_user',
                    'name email active'
                );
            console.log('Members of the workspace: ', result);
            return result;
        } catch (error) {
            console.error('Error in MemberRepository:', error.message);
            throw error;
        }
    }

    async getAllMembershipsByWorkspaceid(workspaceId) {
        return await this.getAllMembershipsByWorkspaceId(workspaceId);
    }

    async getByWorkspaceId(workspaceId) {
        return await this.getAllMembershipsByWorkspaceId(workspaceId);
    }

    async getMembershipByUserAndWorkspace(userId, workspaceId) {
        try {
            const membership = await Member.findOne({
                FK_id_user: userId,
                FK_id_workspace: workspaceId
            });
            return membership;
        } catch (error) {
            console.error('Error in MemberRepository:', error.message);
            throw error;
        }
    }

    async getByWorkspaceAndInvitationToken(workspaceId, invitationToken) {
        try {
            const invitation = await Member.findOne({
                FK_id_workspace: workspaceId,
                invitation_token: invitationToken
            });
            return invitation;
        } catch (error) {
            console.error('Error in MemberRepository:', error.message);
            throw error;
        }
    }

    async acceptInvitation(invitationId) {
        try {
            const accepted = await Member.findByIdAndUpdate(
                invitationId,
                {
                    invitation_accepted: true,
                    invitation_token: null
                },
                { new: true }
            );
            return accepted;
        } catch (error) {
            console.error('Error in MemberRepository:', error.message);
            throw error;
        }
    }

    async getById(memberId) {
        try {
            const member = await Member.findById(memberId);
            return member;
        } catch (error) {
            console.error('Error in MemberRepository:', error.message);
            throw error;
        }
    }
}

const Member_Repository = new MemberRepository()

export default Member_Repository;
