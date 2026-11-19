import workspaceRepository from "../Repositories/WorkSpaceRepository.js";
import memberRepository from "../Repositories/MemberRepository.js";
import invitationRepository from "../Repositories/InvitationRepository.js";
import userRepository from "../Repositories/UserRepository.js";
import ServerError from "../Utils/Error.Utils.js";
import crypto from "crypto";
import ENVIRONMENT from "../Config/Environment.config.js";
import mailer_transporter from "../Config/Mailer.config.js";
import { buildInvitationEmailHtml, buildInvitationEmailText } from "../Utils/email-templates/workspace-invitation-email.js";

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
        // The shareable invitation link points to the join page with this token.
        const inviteLinkToken = crypto.randomBytes(16).toString('hex');
        const createdWorkspace = await workspaceRepository.createWorkspace(name, description, inviteLinkToken);

        // The owner does not need an invitation: they are an active member from the start.
        const ownerMembership = await memberRepository.create(
            userId,
            createdWorkspace._id,
            'Owner',
            { invitation_accepted: true }
        );

        return {
            createdWorkspace,
            ownerMembership
        };
    }

    /*
        Joins the workspace with the token of a shareable invitation link
        (workspace-level token) or with the personal token of a pending
        invitation (sent by email). Returns a small summary of what happened.
    */
    async joinWorkspace(workspaceId, userId, userEmail, invitationToken) {
        if (!invitationToken || typeof invitationToken !== 'string') {
            throw new ServerError("Invitation token is required.", 400);
        }

        const workspace = await workspaceRepository.getById(workspaceId);
        if (!workspace) {
            throw new ServerError("Workspace not found.", 404);
        }

        // 1. Workspace-level invite link: any logged-in user can join.
        if (workspace.invite_link_token === invitationToken) {
            const existingMembership =
                await memberRepository.getMembershipByUserAndWorkspace(userId, workspaceId);

            if (existingMembership) {
                // A pending invitation beats the link: accept it so the user stops seeing "pending".
                if (!existingMembership.invitationAccepted) {
                    await memberRepository.acceptInvitation(existingMembership._id);
                }
                return { joined: true, already_member: true, workspace_name: workspace.name };
            }

            await memberRepository.create(userId, workspaceId, 'User', { invitation_accepted: true });
            return { joined: true, already_member: false, workspace_name: workspace.name };
        }

        // 2. Personal invitation token of a Member (invited user with an account).
        const invitation =
            await memberRepository.getByWorkspaceAndInvitationToken(workspaceId, invitationToken);

        if (invitation) {
            if (invitation.invitationAccepted) {
                throw new ServerError("Invitation was already accepted.", 400);
            }

            if (invitation.invitationExpiresAt && invitation.invitationExpiresAt < new Date()) {
                throw new ServerError("Invitation has expired.", 400);
            }

            const invitedUser = await userRepository.getById(invitation.FK_id_user);
            if (!invitedUser || invitedUser.email !== userEmail) {
                throw new ServerError(
                    "This invitation was sent to another email address.",
                    403
                );
            }

            await memberRepository.acceptInvitation(invitation._id);
            return { joined: true, already_member: false, workspace_name: workspace.name };
        }

        // 3. Invitation for an email without an account: the invitee must
        //    register with the invited email before joining.
        const pendingRegistration =
            await invitationRepository.getByWorkspaceAndInvitationToken(workspaceId, invitationToken);

        if (pendingRegistration) {
            if (pendingRegistration.invitationAccepted) {
                throw new ServerError("Invitation was already accepted.", 400);
            }

            if (pendingRegistration.invitationExpiresAt && pendingRegistration.invitationExpiresAt < new Date()) {
                throw new ServerError("Invitation has expired.", 400);
            }

            if (pendingRegistration.email !== userEmail.toLowerCase()) {
                throw new ServerError(
                    "This invitation was sent to another email address.",
                    403
                );
            }

            const existingMembership =
                await memberRepository.getMembershipByUserAndWorkspace(userId, workspaceId);

            await invitationRepository.acceptById(pendingRegistration._id);

            if (existingMembership) {
                return { joined: true, already_member: true, workspace_name: workspace.name };
            }

            await memberRepository.create(userId, workspaceId, 'User', { invitation_accepted: true });
            return { joined: true, already_member: false, workspace_name: workspace.name };
        }

        throw new ServerError("Invitation not found.", 404);
    }

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

    async createInvitations(workspaceId, inviterName, emails) {
        if (!Array.isArray(emails)) {
            throw new ServerError("Emails must be an array.", 400);
        }

        // Normalize, remove duplicates and keep only well-formed emails.
        const normalizedEmails = [...new Set(
            emails
                .filter((email) => typeof email === 'string')
                .map((email) => email.trim().toLowerCase())
                .filter((email) => email.length > 0)
        )];

        if (normalizedEmails.length === 0) {
            throw new ServerError("At least one email address is required.", 400);
        }

        const workspace = await workspaceRepository.getById(workspaceId);
        const workspaceName = workspace ? workspace.name : 'a workspace';

        const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (normalizedEmails.some((email) => !EMAIL_REGEX.test(email))) {
            throw new ServerError("One or more email addresses are not valid.", 400);
        }

        const invited = [];
        const notFound = [];
        const alreadyMembers = [];
        const emailFailed = [];

        // Expiration shared by every invitation created in this batch.
        const invitationExpiresAt = new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
        );

        for (const email of normalizedEmails) {
            const user = await userRepository.getByEmail(email);

            // Email without an active account: the invitation waits in its
            // own collection until that person registers with this address.
            if (!user || !user.active) {
                const pendingRegistration =
                    await invitationRepository.getPendingByEmailAndWorkspace(email, workspaceId);

                if (pendingRegistration) {
                    // There is already a pending invitation for this email.
                    alreadyMembers.push(email);
                    continue;
                }

                const registrationToken = crypto.randomBytes(16).toString('hex');

                await invitationRepository.create(
                    email,
                    workspaceId,
                    registrationToken,
                    invitationExpiresAt
                );

                try {
                    await mailer_transporter.sendMail({
                        to: email,
                        from: ENVIRONMENT.GMAIL_USER,
                        subject: `${inviterName} invited you to join ${workspaceName}`,
                        html: buildInvitationEmailHtml(
                            inviterName,
                            workspaceName,
                            workspaceId,
                            registrationToken
                        ),
                        text: buildInvitationEmailText(
                            inviterName,
                            workspaceName,
                            workspaceId,
                            registrationToken
                        )
                    });
                } catch (emailError) {
                    console.error('Invitation email could not be sent:', emailError.message);
                    emailFailed.push(email);
                }

                invited.push(email);
                continue;
            }

            const existingMembership =
                await memberRepository.getMembershipByUserAndWorkspace(
                    user._id,
                    workspaceId
                );

            if (existingMembership) {
                alreadyMembers.push(email);
                continue;
            }

            const invitationToken = crypto.randomBytes(16).toString('hex');

            await memberRepository.create(
                user._id,
                workspaceId,
                'User',
                {
                    invitation_token: invitationToken,
                    invitation_expires_at: invitationExpiresAt
                }
            );

            // A failed email does not abort the batch: the summary reports it.
            try {
                await mailer_transporter.sendMail({
                    to: email,
                    from: ENVIRONMENT.GMAIL_USER,
                    subject: `${inviterName} invited you to join ${workspaceName}`,
                    html: buildInvitationEmailHtml(
                        inviterName,
                        workspaceName,
                        workspaceId,
                        invitationToken
                    ),
                    text: buildInvitationEmailText(
                        inviterName,
                        workspaceName,
                        workspaceId,
                        invitationToken
                    )
                });
            } catch (emailError) {
                console.error('Invitation email could not be sent:', emailError.message);
                emailFailed.push(email);
            }

            invited.push(email);
        }

        return {
            invited,
            not_found: notFound,
            already_members: alreadyMembers,
            email_failed: emailFailed
        };
    }
}

export default new WorkspaceService()
