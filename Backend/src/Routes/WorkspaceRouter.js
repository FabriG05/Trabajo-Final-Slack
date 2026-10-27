import express, { response } from 'express'
import workspaceRepository from '../Repositories/WorkSpaceRepository.js'
import memberRepository from '../Repositories/MemberRepository.js'
import authMiddleware from '../Middlewares/AuthMiddleware.js'
import workspaceMiddleware from '../Middlewares/workspaceMiddleware.js'

const workspaceRouter = express.Router()

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
    workspaceMiddleware(['Owner', 'Admin']),
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
    "/api/workspace/:workspaceId",
    authMiddleware,
    workspaceMiddleware(['Owner']),
    async (request, response) => {
        workspaceRepository.deleteById(request.workspace._id)
        return response.status(200).send({
            ok: true,
            message: "Workspace deleted successfully",
            data: {
                deletedWorkspace: request.workspace
            }
        })
    }
)

workspaceRouter.put(
    "/api/workspace/:workspaceId",
    authMiddleware,
    workspaceMiddleware(['Owner', 'Admin']),
    async (request, response) => {
        workspaceRepository.updateById(request.workspace._id)
        return response.status(200).send({
            ok: true,
            message: "Workspace updated successfully",
            data: {
                updatedWorkspace: request.workspace
            }
        })
    }
)

/* Tarea:
- (todos) get /api/workspace/:workspace_id/members
- (owner, admin) DELETE /api/workspace/:workspace_id/members/:member_id
- (owner, admin) POST /api/workspace/:workspace_id/members/invite
    body: email (el email del usuario a invitar)
    - Revisar que el rol con el que se crea sea 'admin' o 'user'
    - Revisar que el usuario a invitar exista
    - Revisar que no este ya agregado al workspace (que tenga una membresia)
    - Crear la membresia con una propiedad 'invitacion_aceptada': false
    - Enviar un mail con un link para "aceptar invitacion" (debe tener una expiracion y debe enviar un token)
        - Ese link hara un GET hacia /api/workspace/:workspace_id/members/accept-invite/:invitation_token

- (todos) Unauthentified /api/workspace/:workspace_id/members/accept-invite/:invitation_token
    - Verifica que el invitation_token sea valido y edita la membersia para marcar que lo acepto
*/

workspaceRouter.get(
    "/api/workspace/:workspaceId/members",
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
    "/api/workspace/:workspaceId/members/:memberId",
    authMiddleware,
    workspaceMiddleware(['Owner', 'Admin']),
    async (request, response) => {
        memberRepository.deleteById(request.member._id)
        return response.status(200).send({
            ok: true,
            message: "Member deleted successfully.",
            data: {
                deletedMember: request.member
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

        if (invitation.invitationExpiresAt < new Date()) {
            throw new ServerError("Invitation has expired.", 400);
        }

        await memberRepository.acceptInvitation(invitation._id);
        return response.status(200).send({
            ok: true,
            message: "Invitation accepted successfully.",
        });
    }
);

workspaceRouter.get(
    '/',
    authMiddleware,
    async (request, response) => {
        
        const obtainedWorkspaces = await memberRepository.getAllWorkspaceByUserId(request.user.id)
        return response.status(200).send({
            ok:true,
            message: "Obtenidos todos los datos",
            status: 200,
            data: {
                obtainedWorkspaces
            }
        })
    }
)


export default workspaceRouter


/* workspace.router('/:workspaceId/channel', channelRouter) */