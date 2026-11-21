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

channelRouter.use(authMiddleware)
channelRouter.use(workspaceMiddleware(['Owner', 'Admin', 'User']))

channelRouter.get('/', getChannels)

channelRouter.post('/', createChannel)

channelRouter.delete('/:channel_id', deleteChannel)

channelRouter.get('/:channel_id/messages', getChannelMessages)

channelRouter.post('/:channel_id/messages', createChannelMessage)

export default channelRouter
