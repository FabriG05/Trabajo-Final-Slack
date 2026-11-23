/* Schemas for channel endpoints. */

export const Channel = {
    type: 'object',
    required: ['_id', 'name', 'workspace_id'],
    properties: {
        _id: { type: 'string', example: '675c1c9e2b8d3a00aa112233' },
        name: { type: 'string', example: 'general' },
        workspace_id: { type: 'string', example: '675a1c9e2b8d3a0044556677' },
        created_by: { type: 'string', nullable: true, example: '674f1c9e2b8d3a0011223344' },
        created_at: { type: 'string', format: 'date-time' }
    }
}

export const CreateChannelBody = {
    type: 'object',
    required: ['name'],
    properties: {
        name: { type: 'string', example: 'qa-random', description: 'Normalized to lowercase, spaces become hyphens. Letters, numbers, hyphens, underscores only.' }
    }
}

export const ChannelResponse = {
    type: 'object',
    required: ['ok', 'message', 'data'],
    properties: {
        ok: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Channel created successfully.' },
        data: {
            type: 'object',
            required: ['channel'],
            properties: { channel: { $ref: '#/components/schemas/Channel' } }
        }
    }
}

export const ChannelListResponse = {
    type: 'object',
    required: ['ok', 'message', 'data'],
    properties: {
        ok: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Channels retrieved successfully.' },
        data: {
            type: 'object',
            required: ['channels'],
            properties: { channels: { type: 'array', items: { $ref: '#/components/schemas/Channel' } } }
        }
    }
}

export const DeleteChannelResponse = {
    type: 'object',
    required: ['ok', 'message', 'data'],
    properties: {
        ok: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Channel deleted successfully.' },
        data: {
            type: 'object',
            required: ['deletedChannel'],
            properties: { deletedChannel: { $ref: '#/components/schemas/Channel' } }
        }
    }
}

export default { Channel, CreateChannelBody, ChannelResponse, ChannelListResponse, DeleteChannelResponse }
