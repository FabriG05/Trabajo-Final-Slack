import express from 'express'
import {
    getAllWorkspaces,
    createWorkspace,
    getWorkspaceById,
    deleteWorkspace,
    updateWorkspace,
    getWorkspaceMembers,
    deleteWorkspaceMember,
    updateWorkspaceMemberRole,
    joinWorkspace,
    createInvitations
} from '../Controllers/WorkspaceControllers.js'
import authMiddleware from '../Middlewares/AuthMiddleware.js'
import workspaceMiddleware from '../Middlewares/WorkspaceMiddelware.js'
import channelRouter from './ChannelRouter.js'
import {
    getActivity,
    getDirectMessageSummaries,
    getDirectMessages,
    createDirectMessage,
    deleteMessage,
    updateMessage,
    searchWorkspace
} from '../Controllers/MessageControllers.js'
import {
    markConversationRead,
    getUnreadCounts
} from '../Controllers/ReadControllers.js'
import {
    getStarredMessages,
    starMessage,
    unstarMessage
} from '../Controllers/StarredMessageControllers.js'

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

workspaceRouter.put(
    "/:workspace_id/members/:member_id/role",
    authMiddleware,
    workspaceMiddleware(['Owner', 'Admin']),
    updateWorkspaceMemberRole
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
    Read state: persisted last-read date per conversation and the unread
    counts used to rebuild the sidebar badges on load.
*/
workspaceRouter.get(
    "/:workspace_id/unread",
    authMiddleware,
    workspaceMiddleware(['Owner', 'Admin', 'User']),
    getUnreadCounts
)

workspaceRouter.put(
    "/:workspace_id/reads/:conversation_key",
    authMiddleware,
    workspaceMiddleware(['Owner', 'Admin', 'User']),
    markConversationRead
)

workspaceRouter.get(
    "/:workspace_id/starred",
    authMiddleware,
    workspaceMiddleware(['Owner', 'Admin', 'User']),
    getStarredMessages
)

workspaceRouter.post(
    "/:workspace_id/starred/:message_id",
    authMiddleware,
    workspaceMiddleware(['Owner', 'Admin', 'User']),
    starMessage
)

workspaceRouter.delete(
    "/:workspace_id/starred/:message_id",
    authMiddleware,
    workspaceMiddleware(['Owner', 'Admin', 'User']),
    unstarMessage
)

/*
    Workspace search: channels, members and messages visible to the user.
*/
workspaceRouter.get(
    "/:workspace_id/search",
    authMiddleware,
    workspaceMiddleware(['Owner', 'Admin', 'User']),
    searchWorkspace
)

/*
    Activity feed: channel messages that mention the signed-in user.
    Unread direct messages are added by the client from its live state.
*/
workspaceRouter.get(
    "/:workspace_id/activity",
    authMiddleware,
    workspaceMiddleware(['Owner', 'Admin', 'User']),
    getActivity
)

/*
    Latest direct message per conversation partner, used by the DMs
    screen to render previews without opening every conversation.
*/
workspaceRouter.get(
    "/:workspace_id/direct-messages",
    authMiddleware,
    workspaceMiddleware(['Owner', 'Admin', 'User']),
    getDirectMessageSummaries
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

/*
    A single message of either a channel or a direct conversation. The
    service checks that it belongs to this workspace and that the
    requester is the author, an admin or the owner.
*/
workspaceRouter.put(
    "/:workspace_id/messages/:message_id",
    authMiddleware,
    workspaceMiddleware(['Owner', 'Admin', 'User']),
    updateMessage
)

workspaceRouter.delete(
    "/:workspace_id/messages/:message_id",
    authMiddleware,
    workspaceMiddleware(['Owner', 'Admin', 'User']),
    deleteMessage
)

workspaceRouter.use('/:workspace_id/channels', channelRouter)

export default workspaceRouter
