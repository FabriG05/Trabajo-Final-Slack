/*
    Paths of /api/user. All endpoints require a bearer token.
*/

import { commonResponses } from '../schemas/common.schemas.js'

export default {
    '/api/user': {
        get: {
            tags: ['Users'],
            operationId: 'getUsers',
            summary: 'List all users',
            description:
                'Returns every active user in the database. Requires authentication. ' +
                'The bcrypt password hash is stripped from every user.',
            security: [{ bearerAuth: [] }],
            responses: {
                '200': {
                    description: 'Full list of active users (possibly empty).',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/UserListResponse' }
                        }
                    }
                },
                '401': {
                    description: 'Missing, malformed or invalid JWT (AuthMiddleware).',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                            examples: {
                                AuthHeaderMissing: { value: { ok: false, message: 'Auth header is required.' } },
                                AuthHeaderMalformed: { value: { ok: false, message: 'Auth token is required or malformed.' } },
                                Unauthorized: { value: { ok: false, message: 'Auth token is invalid.' } }
                            }
                        }
                    }
                },
                '500': { $ref: '#/components/responses/InternalServerError' }
            }
        }
    },

    '/api/user/me': {
        get: {
            tags: ['Users'],
            operationId: 'getCurrentUser',
            summary: 'Get the authenticated user',
            description: 'Returns the profile of the user identified by the bearer token.',
            security: [{ bearerAuth: [] }],
            responses: {
                '200': {
                    description: 'Current user profile.',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/UserResponse' },
                            example: {
                                ok: true,
                                message: 'Current user retrieved successfully',
                                data: { user: { _id: '674f1c9e2b8d3a0011223344', name: 'Fabri', email: 'someone@test.com' } }
                            }
                        }
                    }
                },
                '401': { $ref: '#/components/responses/Unauthorized' },
                '404': {
                    description: 'The token user no longer exists.',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                            example: { ok: false, message: 'User not found' }
                        }
                    }
                },
                '500': { $ref: '#/components/responses/InternalServerError' }
            }
        }
    },

    '/api/user/{user_id}': {
        get: {
            tags: ['Users'],
            operationId: 'getUserById',
            summary: 'Get a user by id',
            description: 'Requires authentication.',
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'user_id',
                    in: 'path',
                    required: true,
                    schema: { type: 'string' },
                    example: '674f1c9e2b8d3a0011223344',
                    description: 'MongoDB ObjectId of the user.'
                }
            ],
            responses: {
                '200': {
                    description: 'User found.',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/UserResponse' }
                        }
                    }
                },
                '400': {
                    description: 'Invalid id format.',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                            example: { ok: false, message: 'Invalid id format.' }
                        }
                    }
                },
                '401': { $ref: '#/components/responses/Unauthorized' },
                '404': {
                    description: 'No user with that id (UserService).',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                            example: { ok: false, message: 'User not found' }
                        }
                    }
                },
                '500': { $ref: '#/components/responses/InternalServerError' }
            }
        }
    },

    '/api/user/profile': {
        put: {
            tags: ['Users'],
            operationId: 'updateProfile',
            summary: 'Update the profile of the logged-in user',
            description:
                'Updates the authenticated user. Both fields are optional: send only the ones that change. ' +
                'The profile photo travels as a base64 JPEG string (the client should compress it to ~256px; ' +
                'anything above ~500 KB is rejected). Send `profile_photo: null` to clear it.',
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/UpdateProfileBody' }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Profile updated.',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/UserResponse' },
                            example: {
                                message: 'Profile updated successfully',
                                ok: true,
                                data: { user: { _id: '674f1c9e2b8d3a0011223344' } }
                            }
                        }
                    }
                },
                '400': {
                    description: 'Validation failure.',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                            examples: {
                                EmptyName: { value: { ok: false, message: 'Name cannot be empty.' } },
                                InvalidPhoto: { value: { ok: false, message: 'Profile photo must be a base64 string.' } }
                            }
                        }
                    }
                },
                '401': { $ref: '#/components/responses/Unauthorized' },
                '404': {
                    description: 'The token user no longer exists (UserService).',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                            example: { ok: false, message: 'User not found' }
                        }
                    }
                },
                '413': {
                    description: 'The base64 photo exceeds ~500 KB (UserService).',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                            example: { ok: false, message: 'Profile photo is too large.' }
                        }
                    }
                },
                '500': { $ref: '#/components/responses/InternalServerError' }
            }
        }
    },

    '/api/user/status': {
        put: {
            tags: ['Users'],
            operationId: 'updateUserStatus',
            summary: 'Set the status of the logged-in user',
            description: 'Sets the presence status of the authenticated user. Requires authentication.',
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/UpdateStatusBody' }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Status updated.',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/UserResponse' }
                        }
                    }
                },
                '400': {
                    description: 'Invalid status value.',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                            example: { ok: false, message: 'Status must be online, away, offline or do not disturb.' }
                        }
                    }
                },
                '401': { $ref: '#/components/responses/Unauthorized' },
                '404': {
                    description: 'The token user no longer exists (UserService).',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                            example: { ok: false, message: 'User not found' }
                        }
                    }
                },
                '500': { $ref: '#/components/responses/InternalServerError' }
            }
        }
    }
}
