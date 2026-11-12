import workspaceRepository from "../Repositories/WorkSpaceRepository.js";
import memberRepository from "../Repositories/MemberRepository.js";
import ServerError from "../Utils/Error.Utils.js";

/*
    Workspace service. This layer holds the business logic of the
    workspace endpoints; the controllers only extract the data from the
    HTTP request, hand it over here and build the response.

    Errors are thrown as ServerError (message, status) and handled by
    the error middleware, so neither this layer nor the controllers
    need try/catch blocks.
*/

class WorkspaceService {
    /*
        Returns the workspaces of the user. Each workspace carries the
        list of its active members (invitation already accepted and the
        user still active) with only their name and role.
    */
    async getAllWorkspacesByUserId(userId) {
        // 1. Memberships of the user, with their workspace populated.
        const memberships = await memberRepository.getAllWorkspaceByUserId(userId);

        // Workspaces that were deleted leave orphan memberships behind; they are skipped.
        const validMemberships = memberships.filter(
            (membership) => membership.FK_id_workspace
        );

        // 2. One single query brings the active members of every workspace at once.
        const workspaceIds = validMemberships.map(
            (membership) => membership.FK_id_workspace._id
        );

        const activeMembers = workspaceIds.length > 0
            ? await memberRepository.getActiveMembersByWorkspaceIds(workspaceIds)
            : [];

        // 3. Group the active members by workspace id.
        const membersByWorkspace = new Map();
        for (const member of activeMembers) {
            // The user comes null when the document no longer exists or was deactivated.
            if (!member.FK_id_user || !member.FK_id_user.active) {
                continue;
            }

            const workspaceId = String(member.FK_id_workspace);
            const members = membersByWorkspace.get(workspaceId) ?? [];

            members.push({
                name: member.FK_id_user.name,
                role: member.role
            });

            membersByWorkspace.set(workspaceId, members);
        }

        // 4. Shape the response: one entry per workspace, each with its active members.
        return validMemberships.map((membership) => {
            const workspace = membership.FK_id_workspace;

            return {
                _id: workspace._id,
                name: workspace.name,
                description: workspace.description,
                created_at: workspace.created_at,
                members: membersByWorkspace.get(String(workspace._id)) ?? []
            };
        });
    }

    async createWorkspace(userId, name, description) {
        const createdWorkspace = await workspaceRepository.createWorkspace(name, description);
        const ownerMembership = await memberRepository.create(
            userId,
            createdWorkspace._id,
            'Owner'
        );

        return {
            createdWorkspace,
            ownerMembership
        };
    }

    /*
        The workspace itself and the membership of the requester are
        already validated and attached to the request by the workspace
        middleware, so the read only needs what the middleware found.
    */
    async getWorkspaceById(workspace) {
        return workspace;
    }

    async deleteWorkspace(workspaceId) {
        return workspaceRepository.deleteById(workspaceId);
    }

    async updateWorkspace(workspaceId, name, description) {
        return workspaceRepository.updateById(workspaceId, { name, description });
    }

    async getWorkspaceMembers(workspaceId) {
        return memberRepository.getByWorkspaceId(workspaceId);
    }

    async deleteWorkspaceMember(memberId) {
        return memberRepository.deleteById(memberId);
    }

    async acceptInvitation(workspaceId, invitationToken) {
        const invitation =
            await memberRepository.getByWorkspaceAndInvitationToken(
                workspaceId,
                invitationToken
            );

        if (!invitation) {
            throw new ServerError("Invitation not found.", 404);
        }

        if (invitation.invitationAccepted) {
            throw new ServerError("Invitation was already accepted.", 400);
        }

        if (invitation.invitationExpiresAt && invitation.invitationExpiresAt < new Date()) {
            throw new ServerError("Invitation has expired.", 400);
        }

        await memberRepository.acceptInvitation(invitation._id);
    }
}

export default new WorkspaceService()
