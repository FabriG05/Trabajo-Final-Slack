import express from 'express'
import authMiddleware from '../Middlewares/AuthMiddleware.js'
import workspaceMiddleware from '../Middlewares/WorkspaceMiddelware.js'
import {
    getChannels,
    createChannel,
    deleteChannel
} from '../Controllers/ChannelControllers.js'
import {
    getChannelMessages,
    createChannelMessage
} from '../Controllers/MessageControllers.js'

/*
    Channel routes, mounted under /api/workspace/:workspace_id/channels.
    mergeParams lets the handlers read the workspace_id of the parent
    router. Every route requires a logged-in member of the workspace.
*/

const channelRouter = express.Router({ mergeParams: true })

const memberRoles = ['Owner', 'Admin', 'User']
const managerRoles = ['Owner', 'Admin']

channelRouter.use(authMiddleware)

channelRouter.get('/', workspaceMiddleware(memberRoles), getChannels)

channelRouter.post('/', workspaceMiddleware(memberRoles), createChannel)

// Only owners and admins can delete a channel (and its messages).
channelRouter.delete('/:channel_id', workspaceMiddleware(managerRoles), deleteChannel)

channelRouter.get('/:channel_id/messages', workspaceMiddleware(memberRoles), getChannelMessages)

channelRouter.post('/:channel_id/messages', workspaceMiddleware(memberRoles), createChannelMessage)

export default channelRouter
