import express from 'express'
import workspaceRepository from '../Repositories/WorkSpaceRepository.js'
import memberRepository from '../Repositories/MemberRepository.js'
import authMiddleware from '../Middlewares/AuthMiddleware.js'
import workspaceMiddleware from '../Middlewares/WorkspaceMiddelware.js'
import channelRouter from './ChannelRouter.js'
import ServerError from '../Utils/Error.Utils.js'

const workspaceRouter = express.Router()

workspaceRouter.get(
    '/',
    authMiddleware,
    async (request, response) => {
        const obtainedWorkspaces = await memberRepository.getAllWorkspaceByUserId(request.user.id)
        return response.status(200).send({
            ok: true,
            message: "All data retrieved successfully",
            status: 200,
            data: {
                obtainedWorkspaces
            }
        })
    }
)

workspaceRouter.post(
    '/',
    authMiddleware,
    async (request, response) => {
        console.log('[CREATE WORKSPACE]', request.user)
        const { name, description } = request.body

        const createdWorkspace = await workspaceRepository.createWorkspace(name, description)
        const ownerMembership = await memberRepository.create(
            request.user.id,
            createdWorkspace._id,
            'Owner'
        )

        return response.status(201).send(
            {
                ok: true,
                message: "Everything is fine so far",
                data: {
                    createdWorkspace,
                    ownerMembership
                }
            }
        )
    }
)

workspaceRouter.get(
    '/:workspace_id',
    authMiddleware,
    workspaceMiddleware(['Owner', 'Admin', 'User']),
    async (request, response) => {
        return response.status(200).send({
            ok: true,
            message: "Workspace retrieved successfully",
            data: {
                selectedWorkspace: request.workspace
            }
        })
    }
)

workspaceRouter.delete(
    "/:workspace_id",
    authMiddleware,
    workspaceMiddleware(['Owner']),
    async (request, response) => {
        const deletedWorkspace = await workspaceRepository.deleteById(request.workspace._id)
        return response.status(200).send({
            ok: true,
            message: "Workspace deleted successfully",
            data: {
                deletedWorkspace
            }
        })
    }
)

workspaceRouter.put(
    "/:workspace_id",
    authMiddleware,
    workspaceMiddleware(['Owner', 'Admin']),
    async (request, response) => {
        const { name, description } = request.body
        const updatedWorkspace = await workspaceRepository.updateById(request.workspace._id, { name, description })
        return response.status(200).send({
            ok: true,
            message: "Workspace updated successfully",
            data: {
                updatedWorkspace
            }
        })
    }
)

workspaceRouter.get(
    "/:workspace_id/members",
    authMiddleware,
    workspaceMiddleware(['Owner', 'Admin', 'User']),
    async (request, response) => {
        const members = await memberRepository.getByWorkspaceId(request.workspace._id)
        return response.status(200).send({
            ok: true,
            message: "Members retrieved successfully.",
            data: {
                members
            }
        })
    }
)

workspaceRouter.delete(
    "/:workspace_id/members/:member_id",
    authMiddleware,
    workspaceMiddleware(['Owner', 'Admin']),
    async (request, response) => {
        const { member_id } = request.params
        const deletedMember = await memberRepository.deleteById(member_id)
        return response.status(200).send({
            ok: true,
            message: "Member deleted successfully.",
            data: {
                deletedMember
            }
        })
    }
)

workspaceRouter.get(
    "/:workspace_id/members/accept-invite/:invitation_token",
    async (request, response) => {
        const { workspace_id, invitation_token } = request.params;

        const invitation =
            await memberRepository.getByWorkspaceAndInvitationToken(
                workspace_id,
                invitation_token
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
        return response.status(200).send({
            ok: true,
            message: "Invitation accepted successfully.",
        });
    }
);

workspaceRouter.use('/:workspace_id/channels', channelRouter)

export default workspaceRouter
