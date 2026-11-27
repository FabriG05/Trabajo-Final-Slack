/* Schemas for channel messages, DMs, reads, activity. */

export const MessageSender = {
    type: 'object',
    properties: {
        _id: { type: 'string', example: '674f1c9e2b8d3a0011223344' },
        name: { type: 'string', example: 'Fabri' },
        email: { type: 'string', format: 'email' },
        profile_photo: { type: 'string', nullable: true }
    }
}

export const Message = {
    type: 'object',
    required: ['_id', 'content', 'sender_id', 'workspace_id', 'message_type'],
    properties: {
        _id: { type: 'string', example: '675d1c9e2b8d3a00bb112233' },
        workspace_id: { type: 'string' },
        sender_id: { oneOf: [{ type: 'string' }, { $ref: '#/components/schemas/MessageSender' }] },
        message_type: { type: 'string', enum: ['channel', 'direct'] },
        channel_id: { type: 'string', nullable: true },
        receiver_id: { type: 'string', nullable: true },
        content: { type: 'string', example: 'Hello @Fabri' },
        edited: { type: 'boolean', example: false },
        created_at: { type: 'string', format: 'date-time' }
    }
}

export const MessageListResponse = {
    type: 'object',
    required: ['ok', 'message', 'data'],
    properties: {
        ok: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Messages retrieved successfully.' },
        data: {
            type: 'object',
            required: ['messages'],
            properties: { messages: { type: 'array', items: { $ref: '#/components/schemas/Message' } } }
        }
    }
}

export const MessageResponse = {
    type: 'object',
    required: ['ok', 'message', 'data'],
    properties: {
        ok: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Message sent successfully.' },
        data: {
            type: 'object',
            required: ['message'],
            properties: { message: { $ref: '#/components/schemas/Message' } }
        }
    }
}

export const DeleteMessageResponse = {
    type: 'object',
    required: ['ok', 'message', 'data'],
    properties: {
        ok: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Message deleted successfully.' },
        data: {
            type: 'object',
            required: ['deletedMessage'],
            properties: { deletedMessage: { $ref: '#/components/schemas/Message' } }
        }
    }
}

export const SendMessageBody = {
    type: 'object',
    required: ['content'],
    properties: { content: { type: 'string', example: 'Hello team', description: 'Trimmed, max 4000 chars.' } }
}

export const UnreadCountsResponse = {
    type: 'object',
    required: ['ok', 'message', 'data'],
    properties: {
        ok: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Unread counts retrieved successfully.' },
        data: {
            type: 'object',
            required: ['counts'],
            properties: {
                counts: {
                    type: 'object',
                    additionalProperties: { type: 'integer', minimum: 0 },
                    description: 'Map of conversation key (channel id or user id) to unread count. Only keys with count > 0 are present.'
                }
            }
        }
    }
}

export const MarkReadBody = {
    type: 'object',
    required: ['type'],
    properties: { type: { type: 'string', enum: ['channel', 'direct'] } }
}

export const MarkReadResponse = {
    type: 'object',
    required: ['ok', 'message', 'data'],
    properties: {
        ok: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Conversation marked as read.' },
        data: { type: 'object', properties: { read: { type: 'object' } } }
    }
}

export const ActivityResponse = {
    type: 'object',
    required: ['ok', 'message', 'data'],
    properties: {
        ok: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Activity retrieved successfully.' },
        data: {
            type: 'object',
            required: ['mentions'],
            properties: {
                mentions: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            content: { type: 'string' },
                            created_at: { type: 'string', format: 'date-time' },
                            is_new: { type: 'boolean' },
                            channel: { type: 'object', nullable: true, properties: { id: { type: 'string' }, name: { type: 'string' } } },
                            sender: { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' }, photo: { type: 'string', nullable: true } } }
                        }
                    }
                }
            }
        }
    }
}

export const DMSummariesResponse = {
    type: 'object',
    required: ['ok', 'message', 'data'],
    properties: {
        ok: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Direct message summaries retrieved successfully.' },
        data: {
            type: 'object',
            required: ['conversations'],
            properties: {
                conversations: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            user_id: { type: 'string' },
                            last_message: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string' },
                                    content: { type: 'string' },
                                    sender_id: { type: 'string' },
                                    created_at: { type: 'string', format: 'date-time' }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

export const WorkspaceSearchResponse = {
    type: 'object',
    required: ['ok', 'message', 'data'],
    properties: {
        ok: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Search results retrieved successfully.' },
        data: {
            type: 'object',
            required: ['channels', 'members', 'messages'],
            properties: {
                channels: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                            type: { type: 'string', example: 'channel' }
                        }
                    }
                },
                members: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                            email: { type: 'string' },
                            photo: { type: 'string', nullable: true },
                            status: { type: 'string' },
                            role: { type: 'string' },
                            type: { type: 'string', example: 'member' }
                        }
                    }
                },
                messages: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            content: { type: 'string' },
                            created_at: { type: 'string', format: 'date-time' },
                            type: { type: 'string', example: 'message' },
                            message_type: { type: 'string', enum: ['channel', 'direct'] },
                            sender: { type: 'object' },
                            channel: { type: 'object', nullable: true },
                            dm: { type: 'object', nullable: true }
                        }
                    }
                }
            }
        }
    }
}

export default { MessageSender, Message, MessageListResponse, MessageResponse, DeleteMessageResponse, SendMessageBody, UnreadCountsResponse, MarkReadBody, MarkReadResponse, ActivityResponse, DMSummariesResponse, WorkspaceSearchResponse }
