import { commonResponses } from '../schemas/common.schemas.js'

const workspaceIdParam = { name: 'workspace_id', in: 'path', required: true, schema: { type: 'string' }, example: '675a1c9e2b8d3a0044556677' }
const channelIdParam = { name: 'channel_id', in: 'path', required: true, schema: { type: 'string' }, example: '675c1c9e2b8d3a00aa112233' }

const auth401 = {
    '401': {
        description: 'Missing, malformed or invalid JWT (AuthMiddleware).',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
    }
}
const forbiddenMember = {
    '403': {
        description: 'Not a workspace member or insufficient role.',
        content: {
            'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                    NotMember: { value: { ok: false, message: 'You are not a member of this workspace' } },
                    Insufficient: { value: { ok: false, message: 'You do not have enough permissions to perform this operation' } }
                }
            }
        }
    },
    '404': {
        description: 'Workspace not found.',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { ok: false, message: 'Workspace not found' } } }
    }
}

export default {
    '/api/workspace/{workspace_id}/channels': {
        get: {
            tags: ['Channels'],
            operationId: 'getChannels',
            summary: 'List channels in a workspace',
            security: [{ bearerAuth: [] }],
            parameters: [workspaceIdParam],
            responses: {
                '200': { description: 'Channels list.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ChannelListResponse' } } } },
                ...auth401, ...forbiddenMember, '500': { $ref: '#/components/responses/InternalServerError' }
            }
        },
        post: {
            tags: ['Channels'],
            operationId: 'createChannel',
            summary: 'Create a channel in a workspace',
            security: [{ bearerAuth: [] }],
            parameters: [workspaceIdParam],
            requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateChannelBody' } } } },
            responses: {
                '201': { description: 'Channel created.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ChannelResponse' } } } },
                '400': { description: 'Invalid name.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                ...auth401, ...forbiddenMember,
                '409': { description: 'Duplicate channel name.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { ok: false, message: 'A channel with that name already exists in this workspace.' } } } },
                '500': { $ref: '#/components/responses/InternalServerError' }
            }
        }
    },
    '/api/workspace/{workspace_id}/channels/{channel_id}': {
        delete: {
            tags: ['Channels'],
            operationId: 'deleteChannel',
            summary: 'Delete a channel (Owner/Admin)',
            security: [{ bearerAuth: [] }],
            parameters: [workspaceIdParam, channelIdParam],
            responses: {
                '200': { description: 'Channel deleted.', content: { 'application/json': { schema: { $ref: '#/components/schemas/DeleteChannelResponse' } } } },
                '400': { description: 'Cannot delete #general.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { ok: false, message: 'The #general channel cannot be deleted.' } } } },
                ...auth401, ...forbiddenMember,
                '404': { description: 'Channel/workspace not found.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { ok: false, message: 'Channel not found.' } } } },
                '500': { $ref: '#/components/responses/InternalServerError' }
            }
        }
    },
    '/api/workspace/{workspace_id}/channels/{channel_id}/messages': {
        get: {
            tags: ['Messages'],
            operationId: 'getChannelMessages',
            summary: 'List messages in a channel',
            security: [{ bearerAuth: [] }],
            parameters: [workspaceIdParam, channelIdParam],
            responses: {
                '200': { description: 'Messages list.', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageListResponse' } } } },
                ...auth401, ...forbiddenMember,
                '404': { description: 'Channel not found.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { ok: false, message: 'Channel not found.' } } } },
                '500': { $ref: '#/components/responses/InternalServerError' }
            }
        },
        post: {
            tags: ['Messages'],
            operationId: 'createChannelMessage',
            summary: 'Send a message to a channel',
            security: [{ bearerAuth: [] }],
            parameters: [workspaceIdParam, channelIdParam],
            requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/SendMessageBody' } } } },
            responses: {
                '201': { description: 'Message sent.', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } } },
                '400': { description: 'Invalid content.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                ...auth401, ...forbiddenMember,
                '404': { description: 'Channel not found.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { ok: false, message: 'Channel not found.' } } } },
                '500': { $ref: '#/components/responses/InternalServerError' }
            }
        }
    }
}
