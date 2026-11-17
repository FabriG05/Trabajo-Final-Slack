import express from 'express'
import {
    getAllWorkspaces,
    createWorkspace,
    getWorkspaceById,
    deleteWorkspace,
    updateWorkspace,
    getWorkspaceMembers,
    deleteWorkspaceMember,
    acceptInvitation,
    createInvitations
} from '../Controllers/WorkspaceControllers.js'
import authMiddleware from '../Middlewares/AuthMiddleware.js'
import workspaceMiddleware from '../Middlewares/WorkspaceMiddelware.js'
import channelRouter from './ChannelRouter.js'

const workspaceRouter = express.Router()

workspaceRouter.get('/', authMiddleware, getAllWorkspaces)

workspaceRouter.post('/', authMiddleware, createWorkspace)

workspaceRouter.get(
    '/:workspace_id',
    authMiddleware,
    workspaceMiddleware(['Owner', 'Admin', 'User']),
    getWorkspaceById
)

workspaceRouter.delete(
    "/:workspace_id",
    authMiddleware,
    workspaceMiddleware(['Owner']),
    deleteWorkspace
)

workspaceRouter.put(
    "/:workspace_id",
    authMiddleware,
    workspaceMiddleware(['Owner', 'Admin']),
    updateWorkspace
)

workspaceRouter.get(
    "/:workspace_id/members",
    authMiddleware,
    workspaceMiddleware(['Owner', 'Admin', 'User']),
    getWorkspaceMembers
)

workspaceRouter.delete(
    "/:workspace_id/members/:member_id",
    authMiddleware,
    workspaceMiddleware(['Owner', 'Admin']),
    deleteWorkspaceMember
)

workspaceRouter.get(
    "/:workspace_id/members/accept-invite/:invitation_token",
    acceptInvitation
)

workspaceRouter.post(
    "/:workspace_id/invitations",
    authMiddleware,
    workspaceMiddleware(['Owner', 'Admin']),
    createInvitations
)

workspaceRouter.use('/:workspace_id/channels', channelRouter)

export default workspaceRouter
