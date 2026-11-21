/*
    Paths of /api/user. `GET /` and `GET /{user_id}` are public;
    `PUT /profile` and `PUT /status` require a bearer token.
*/

import { commonResponses } from '../schemas/common.schemas.js'

export default {
    '/api/user': {
        get: {
            tags: ['Users'],
            operationId: 'getUsers',
            summary: 'List all users',
            description:
                'Returns every user in the database. Public endpoint: it does not require a token. ' +
                'The bcrypt password hash is stripped from every user.',
            responses: {
                '200': {
                    description: 'Full list of users (possibly empty).',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/UserListResponse' }
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
            description: 'Public endpoint: it does not require a token.',
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
                '404': {
                    description: 'No user with that id (UserService).',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                            example: { ok: false, message: 'User not found' }
                        }
                    }
                },
                '500': {
                    description:
                        'Unexpected failure; also returned when `user_id` is not a valid ObjectId ' +
                        '(Mongoose CastError reaches the ErrorMiddleware without a status).',
                    ...commonResponses.InternalServerError
                }
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
                    description:
                        'Validation failure, from the service or from AuthMiddleware / ErrorMiddleware.',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                            examples: {
                                AuthHeaderMissing: {
                                    summary: 'No Authorization header (AuthMiddleware)',
                                    value: { ok: false, message: 'Auth header is required.' }
                                },
                                AuthHeaderMalformed: {
                                    summary: 'The header is not "Bearer <token>" (AuthMiddleware)',
                                    value: { ok: false, message: 'Auth token is required or malformed.' }
                                },
                                EmptyName: {
                                    summary: 'The new name is empty after trimming',
                                    value: { ok: false, message: 'Name cannot be empty.' }
                                },
                                InvalidPhoto: {
                                    summary: 'The photo is neither a base64 string nor null',
                                    value: { ok: false, message: 'Profile photo must be a base64 string.' }
                                }
                            }
                        }
                    }
                },
                '401': {
                    description: 'The JWT is invalid or expired (AuthMiddleware).',
                    ...commonResponses.Unauthorized
                },
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
            description:
                'Sets the presence status of the authenticated user: online, away or offline. ' +
                'Requires authentication; only the user can change their own status.',
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
                            schema: { $ref: '#/components/schemas/UserResponse' },
                            example: {
                                message: 'Status updated successfully',
                                ok: true,
                                data: { user: { _id: '674f1c9e2b8d3a0011223344' } }
                            }
                        }
                    }
                },
                '400': {
                    description:
                        'Validation failure, from the service or from AuthMiddleware / ErrorMiddleware.',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                            examples: {
                                AuthHeaderMissing: {
                                    summary: 'No Authorization header (AuthMiddleware)',
                                    value: { ok: false, message: 'Auth header is required.' }
                                },
                                InvalidStatus: {
                                    summary: 'The status is not one of online, away, offline or do not disturb (UserService).',
                                    value: { ok: false, message: 'Status must be online, away, offline or do not disturb.' }
                                }
                            }
                        }
                    }
                },
                '401': {
                    description: 'The JWT is invalid or expired (AuthMiddleware).',
                    ...commonResponses.Unauthorized
                },
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
