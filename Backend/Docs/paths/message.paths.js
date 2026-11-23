import { commonResponses } from '../schemas/common.schemas.js'

const workspaceIdParam = { name: 'workspace_id', in: 'path', required: true, schema: { type: 'string' }, example: '675a1c9e2b8d3a0044556677' }
const userIdParam = { name: 'user_id', in: 'path', required: true, schema: { type: 'string' }, example: '674f1c9e2b8d3a0011223344' }
const messageIdParam = { name: 'message_id', in: 'path', required: true, schema: { type: 'string' }, example: '675d1c9e2b8d3a00bb112233' }
const conversationKeyParam = { name: 'conversation_key', in: 'path', required: true, schema: { type: 'string' }, description: 'Channel id or user id depending on conversation type.' }

const auth401 = { '401': { description: 'Missing, malformed or invalid JWT (AuthMiddleware).', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } } }
const forbiddenMember = {
    '403': { description: 'Not a workspace member or insufficient role.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
    '404': { description: 'Workspace not found.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { ok: false, message: 'Workspace not found' } } } }
}

export default {
    '/api/workspace/{workspace_id}/unread': {
        get: {
            tags: ['Messages'],
            operationId: 'getUnreadCounts',
            summary: 'Get unread counts for the workspace',
            security: [{ bearerAuth: [] }],
            parameters: [workspaceIdParam],
            responses: {
                '200': { description: 'Unread counts.', content: { 'application/json': { schema: { $ref: '#/components/schemas/UnreadCountsResponse' } } } },
                ...auth401, ...forbiddenMember, '500': { $ref: '#/components/responses/InternalServerError' }
            }
        }
    },
    '/api/workspace/{workspace_id}/reads/{conversation_key}': {
        put: {
            tags: ['Messages'],
            operationId: 'markConversationRead',
            summary: 'Mark a channel or DM conversation as read',
            security: [{ bearerAuth: [] }],
            parameters: [workspaceIdParam, conversationKeyParam],
            requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/MarkReadBody' } } } },
            responses: {
                '200': { description: 'Marked as read.', content: { 'application/json': { schema: { $ref: '#/components/schemas/MarkReadResponse' } } } },
                '400': { description: 'Invalid type or key.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                ...auth401, ...forbiddenMember, '500': { $ref: '#/components/responses/InternalServerError' }
            }
        }
    },
    '/api/workspace/{workspace_id}/activity': {
        get: {
            tags: ['Messages'],
            operationId: 'getActivity',
            summary: 'Get channel mentions activity for the current user',
            security: [{ bearerAuth: [] }],
            parameters: [workspaceIdParam],
            responses: {
                '200': { description: 'Activity feed.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ActivityResponse' } } } },
                ...auth401, ...forbiddenMember, '500': { $ref: '#/components/responses/InternalServerError' }
            }
        }
    },
    '/api/workspace/{workspace_id}/direct-messages': {
        get: {
            tags: ['Messages'],
            operationId: 'getDirectMessageSummaries',
            summary: 'List latest DM per conversation partner',
            security: [{ bearerAuth: [] }],
            parameters: [workspaceIdParam],
            responses: {
                '200': { description: 'DM summaries.', content: { 'application/json': { schema: { $ref: '#/components/schemas/DMSummariesResponse' } } } },
                ...auth401, ...forbiddenMember, '500': { $ref: '#/components/responses/InternalServerError' }
            }
        }
    },
    '/api/workspace/{workspace_id}/direct-messages/{user_id}': {
        get: {
            tags: ['Messages'],
            operationId: 'getDirectMessages',
            summary: 'List direct messages with a workspace member',
            security: [{ bearerAuth: [] }],
            parameters: [workspaceIdParam, userIdParam],
            responses: {
                '200': { description: 'DM list.', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageListResponse' } } } },
                ...auth401, ...forbiddenMember,
                '404': { description: 'Target user not an active member.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                '500': { $ref: '#/components/responses/InternalServerError' }
            }
        },
        post: {
            tags: ['Messages'],
            operationId: 'createDirectMessage',
            summary: 'Send a direct message to a workspace member',
            security: [{ bearerAuth: [] }],
            parameters: [workspaceIdParam, userIdParam],
            requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/SendMessageBody' } } } },
            responses: {
                '201': { description: 'DM sent.', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } } },
                '400': { description: 'Invalid content.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                ...auth401, ...forbiddenMember,
                '404': { description: 'Target user not an active member.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                '500': { $ref: '#/components/responses/InternalServerError' }
            }
        }
    },
    '/api/workspace/{workspace_id}/messages/{message_id}': {
        delete: {
            tags: ['Messages'],
            operationId: 'deleteMessage',
            summary: 'Delete a channel or direct message',
            description: 'Author can delete own message; Owner/Admin can delete any message in workspace.',
            security: [{ bearerAuth: [] }],
            parameters: [workspaceIdParam, messageIdParam],
            responses: {
                '200': { description: 'Message deleted.', content: { 'application/json': { schema: { $ref: '#/components/schemas/DeleteMessageResponse' } } } },
                ...auth401, ...forbiddenMember,
                '403': { description: 'Not author and not Owner/Admin.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { ok: false, message: 'You do not have enough permissions to delete this message.' } } } },
                '404': { description: 'Message not found.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { ok: false, message: 'Message not found.' } } } },
                '500': { $ref: '#/components/responses/InternalServerError' }
            }
        }
    }
}
