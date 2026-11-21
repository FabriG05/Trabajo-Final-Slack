import express from 'express'
import {
    getAllWorkspaces,
    createWorkspace,
    getWorkspaceById,
    deleteWorkspace,
    updateWorkspace,
    getWorkspaceMembers,
    deleteWorkspaceMember,
    joinWorkspace,
    createInvitations
} from '../Controllers/WorkspaceControllers.js'
import authMiddleware from '../Middlewares/AuthMiddleware.js'
import workspaceMiddleware from '../Middlewares/WorkspaceMiddelware.js'
import channelRouter from './ChannelRouter.js'
import {
    getDirectMessages,
    createDirectMessage
} from '../Controllers/MessageControllers.js'

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

/*
    Join endpoint: works with the workspace-level invite link token or
    with the personal token of a pending invitation (sent by email).
    It only requires auth: the joiner is not a member yet, so the
    workspace middleware must NOT run here.
*/
workspaceRouter.post(
    "/:workspace_id/join",
    authMiddleware,
    joinWorkspace
)

workspaceRouter.post(
    "/:workspace_id/invitations",
    authMiddleware,
    workspaceMiddleware(['Owner', 'Admin']),
    createInvitations
)

/*
    Direct messages between two active members of the workspace. The
    conversation is identified by the other user's id.
*/
workspaceRouter.get(
    "/:workspace_id/direct-messages/:user_id",
    authMiddleware,
    workspaceMiddleware(['Owner', 'Admin', 'User']),
    getDirectMessages
)

workspaceRouter.post(
    "/:workspace_id/direct-messages/:user_id",
    authMiddleware,
    workspaceMiddleware(['Owner', 'Admin', 'User']),
    createDirectMessage
)

workspaceRouter.use('/:workspace_id/channels', channelRouter)

export default workspaceRouter
