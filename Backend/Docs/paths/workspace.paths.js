/*
    Paths of /api/workspace. Every endpoint requires a bearer token, and every
    `/{workspace_id}` endpoint except /join also runs WorkspaceMiddleware, which
    validates the workspace, the membership and the role.
*/

import { commonResponses } from '../schemas/common.schemas.js'

const workspaceIdParam = {
    name: 'workspace_id',
    in: 'path',
    required: true,
    schema: { type: 'string' },
    example: '675a1c9e2b8d3a0044556677',
    description: 'MongoDB ObjectId of the workspace.'
}

/* 403/404 set for endpoints restricted by role (not all roles allowed). */
const roleRestrictedResponses = {
    '403': {
        description: 'WorkspaceMiddleware rejected the requester.',
        content: {
            'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                    NotMember: {
                        summary: 'The user has no membership in this workspace',
                        value: { ok: false, message: 'You are not a member of this workspace' }
                    },
                    InsufficientRole: {
                        summary: 'The membership role is below the required one',
                        value: { ok: false, message: 'You do not have enough permissions to perform this operation' }
                    }
                }
            }
        }
    },
    '404': {
        description: 'No workspace with that id (WorkspaceMiddleware).',
        content: {
            'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { ok: false, message: 'Workspace not found' }
            }
        }
    }
}

/* 403/404 set for endpoints where every role is allowed (only membership is checked). */
const memberOnlyResponses = {
    '403': {
        description: 'The authenticated user is not a member of the workspace (WorkspaceMiddleware).',
        content: {
            'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { ok: false, message: 'You are not a member of this workspace' }
            }
        }
    },
    '404': roleRestrictedResponses['404']
}

/* Auth responses reused by every protected endpoint. */
const authResponses = {
    '400': {
        description: 'Authorization header missing or malformed (AuthMiddleware).',
        content: {
            'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                    AuthHeaderMissing: {
                        summary: 'No Authorization header',
                        value: { ok: false, message: 'Auth header is required.' }
                    },
                    AuthHeaderMalformed: {
                        summary: 'The header is not "Bearer <token>"',
                        value: { ok: false, message: 'Auth token is required or malformed.' }
                    }
                }
            }
        }
    },
    '401': { ...commonResponses.Unauthorized },
    '500': { $ref: '#/components/responses/InternalServerError' }
}

export default {
    '/api/workspace': {
        get: {
            tags: ['Workspaces'],
            operationId: 'getWorkspaces',
            summary: 'List the workspaces of the logged-in user',
            description:
                'Returns every workspace where the authenticated user holds a membership, each with ' +
                'its active members (invitation accepted, user still active) reduced to name and role. ' +
                'Deleted workspaces with orphan memberships are skipped.',
            security: [{ bearerAuth: [] }],
            responses: {
                '200': {
                    description: 'Memberships of the user (possibly empty).',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/WorkspaceListResponse' }
                        }
                    }
                },
                ...authResponses
            }
        },

        post: {
            tags: ['Workspaces'],
            operationId: 'createWorkspace',
            summary: 'Create a workspace',
            description:
                'Creates the workspace and makes the authenticated user its Owner. `name` is required ' +
                '(max 50 chars); `description` is optional (max 200 chars).',
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/CreateWorkspaceBody' }
                    }
                }
            },
            responses: {
                '201': {
                    description: 'Workspace created; the creator becomes Owner.',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/CreateWorkspaceResponse' }
                        }
                    }
                },
                '400': {
                    description:
                        'Authorization header missing / malformed, or Mongoose validation failure ' +
                        'on `name` / `description` (ErrorMiddleware).',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                            examples: {
                                AuthHeaderMissing: {
                                    summary: 'No Authorization header',
                                    value: { ok: false, message: 'Auth header is required.' }
                                },
                                AuthHeaderMalformed: {
                                    summary: 'The header is not "Bearer <token>"',
                                    value: { ok: false, message: 'Auth token is required or malformed.' }
                                },
                                ValidationError: {
                                    summary: 'Schema validation (missing name, too long, wrong type...)',
                                    value: { ok: false, message: 'Workspace validation failed: name: Path `name` is required.' }
                                }
                            }
                        }
                    }
                },
                '401': { ...commonResponses.Unauthorized },
                '500': { $ref: '#/components/responses/InternalServerError' }
            }
        }
    },

    '/api/workspace/{workspace_id}': {
        get: {
            tags: ['Workspaces'],
            operationId: 'getWorkspaceById',
            summary: 'Get a workspace by id',
            description: 'Requires membership in the workspace (any role: Owner, Admin or User).',
            security: [{ bearerAuth: [] }],
            parameters: [workspaceIdParam],
            responses: {
                '200': {
                    description: 'Workspace found.',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/GetWorkspaceResponse' }
                        }
                    }
                },
                ...authResponses,
                ...memberOnlyResponses
            }
        },

        put: {
            tags: ['Workspaces'],
            operationId: 'updateWorkspace',
            summary: 'Update a workspace',
            description:
                'Updates `name` and/or `description`. Requires the Owner or Admin role. ' +
                'An empty `name` string fails schema validation.',
            security: [{ bearerAuth: [] }],
            parameters: [workspaceIdParam],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/UpdateWorkspaceBody' }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Workspace updated (the updated document is returned).',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/UpdateWorkspaceResponse' }
                        }
                    }
                },
                '400': {
                    description:
                        'Authorization header missing / malformed, or Mongoose validation failure ' +
                        'on the update (ErrorMiddleware).',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                            examples: {
                                AuthHeaderMissing: {
                                    summary: 'No Authorization header',
                                    value: { ok: false, message: 'Auth header is required.' }
                                },
                                ValidationError: {
                                    summary: 'Schema validation (empty name, too long, wrong type...)',
                                    value: { ok: false, message: 'Workspace validation failed: name: Path `name` is required.' }
                                }
                            }
                        }
                    }
                },
                '401': { ...commonResponses.Unauthorized },
                ...roleRestrictedResponses,
                '500': { $ref: '#/components/responses/InternalServerError' }
            }
        },

        delete: {
            tags: ['Workspaces'],
            operationId: 'deleteWorkspace',
            summary: 'Delete a workspace',
            description: 'Requires the Owner role. Deletes the workspace document and cascade-deletes every membership and pending invitation that belonged to it.',
            security: [{ bearerAuth: [] }],
            parameters: [workspaceIdParam],
            responses: {
                '200': {
                    description: 'Workspace deleted (the deleted document is returned).',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/DeleteWorkspaceResponse' }
                        }
                    }
                },
                ...authResponses,
                ...roleRestrictedResponses
            }
        }
    },

    '/api/workspace/{workspace_id}/members': {
        get: {
            tags: ['Workspaces'],
            operationId: 'getWorkspaceMembers',
            summary: 'List the members of a workspace',
            description:
                'Returns every membership of the workspace (pending invitations included), ' +
                'with the user populated as `{_id, name, email, active}`. Requires membership (any role).',
            security: [{ bearerAuth: [] }],
            parameters: [workspaceIdParam],
            responses: {
                '200': {
                    description: 'Memberships of the workspace (possibly empty).',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/MembersResponse' }
                        }
                    }
                },
                ...authResponses,
                ...memberOnlyResponses
            }
        }
    },

    '/api/workspace/{workspace_id}/members/{member_id}': {
        delete: {
            tags: ['Workspaces'],
            operationId: 'deleteWorkspaceMember',
            summary: 'Remove a member from a workspace',
            description:
                'Requires the Owner or Admin role. Note: the answer is always 200; when the id does ' +
                'not match any membership, `data.deletedMember` comes back as null.',
            security: [{ bearerAuth: [] }],
            parameters: [
                workspaceIdParam,
                {
                    name: 'member_id',
                    in: 'path',
                    required: true,
                    schema: { type: 'string' },
                    example: '675b1c9e2b8d3a00778899aa',
                    description: 'MongoDB ObjectId of the membership (not the user).'
                }
            ],
            responses: {
                '200': {
                    description: 'Member deleted, or null when the membership id does not exist.',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/DeleteMemberResponse' }
                        }
                    }
                },
                ...authResponses,
                ...roleRestrictedResponses
            }
        }
    },

    '/api/workspace/{workspace_id}/join': {
        post: {
            tags: ['Workspaces'],
            operationId: 'joinWorkspace',
            summary: 'Join a workspace with an invitation token',
            description:
                'Requires a bearer token: the joiner must be logged in, but they are not a member yet, ' +
                'so WorkspaceMiddleware does not run here. Accepts three kinds of tokens in the body: ' +
                'the workspace-level `invite_link_token` (any logged-in user joins as `User`), the ' +
                'personal token of a pending membership created by POST /invitations (only the invited ' +
                'email can accept it), or the token of an Invitation record for an email without an ' +
                'account (only the account registered with that email can accept it; the membership is ' +
                'created at that moment). When the user already has a pending membership, the token of ' +
                'the invite link marks it as accepted.',
            security: [{ bearerAuth: [] }],
            parameters: [workspaceIdParam],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/JoinBody' }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Joined the workspace (or confirmed an existing membership).',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/JoinResponse' }
                        }
                    }
                },
                '400': {
                    description: 'Missing token, already-accepted invitation or expired invitation (WorkspaceService).',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                            examples: {
                                TokenRequired: {
                                    summary: 'No token in the body',
                                    value: { ok: false, message: 'Invitation token is required.' }
                                },
                                AlreadyAccepted: {
                                    summary: 'The invitation was already accepted',
                                    value: { ok: false, message: 'Invitation was already accepted.' }
                                },
                                Expired: {
                                    summary: 'More than 7 days passed since the invitation was created',
                                    value: { ok: false, message: 'Invitation has expired.' }
                                }
                            }
                        }
                    }
                },
                '403': {
                    description: 'The personal invitation was sent to a different email address.',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                            example: { ok: false, message: 'This invitation was sent to another email address.' }
                        }
                    }
                },
                '404': {
                    description: 'Workspace or invitation not found (WorkspaceService).',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                            examples: {
                                WorkspaceNotFound: {
                                    summary: 'No workspace with that id',
                                    value: { ok: false, message: 'Workspace not found.' }
                                },
                                InvitationNotFound: {
                                    summary: 'No invitation with that token for this workspace',
                                    value: { ok: false, message: 'Invitation not found.' }
                                }
                            }
                        }
                    }
                },
                '500': { $ref: '#/components/responses/InternalServerError' }
            }
        }
    },

    '/api/workspace/{workspace_id}/invitations': {
        post: {
            tags: ['Workspaces'],
            operationId: 'createInvitations',
            summary: 'Invite new members',
            description:
                'Requires the Owner or Admin role. Creates a pending invitation with a token that ' +
                'expires in 7 days, for every email without an existing membership, and sends an ' +
                'invitation email with the accept link to each one. Emails with an active account get ' +
                'a membership (role `User`); emails without an account get an Invitation record that ' +
                'turns into a membership when that person registers with the invited email and opens ' +
                'the link. Sending failures do not abort the batch (see `email_failed`). Emails are ' +
                'deduplicated; the summary reports each outcome.',
            security: [{ bearerAuth: [] }],
            parameters: [workspaceIdParam],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/InvitationsBody' }
                    }
                }
            },
            responses: {
                '201': {
                    description: 'Batch processed; check the summary buckets for each email outcome.',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/InvitationSummaryResponse' }
                        }
                    }
                },
                '400': {
                    description:
                        'Authorization header missing / malformed, or invalid body (WorkspaceService / ErrorMiddleware).',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                            examples: {
                                AuthHeaderMissing: {
                                    summary: 'No Authorization header',
                                    value: { ok: false, message: 'Auth header is required.' }
                                },
                                NotArray: {
                                    summary: '`emails` is not an array',
                                    value: { ok: false, message: 'Emails must be an array.' }
                                },
                                Empty: {
                                    summary: 'No valid email after normalization',
                                    value: { ok: false, message: 'At least one email address is required.' }
                                },
                                InvalidEmail: {
                                    summary: 'One or more emails are not well-formed',
                                    value: { ok: false, message: 'One or more email addresses are not valid.' }
                                }
                            }
                        }
                    }
                },
                '401': { ...commonResponses.Unauthorized },
                ...roleRestrictedResponses,
                '500': { $ref: '#/components/responses/InternalServerError' }
            }
        }
    },

    '/api/workspace/{workspace_id}/channels': {
        get: {
            tags: ['Workspaces'],
            operationId: 'getWorkspaceChannels',
            summary: 'List the channels of a workspace',
            description:
                'Placeholder route: it currently answers with a fixed confirmation message and no channel data. ' +
                '**Note:** this endpoint is not yet protected by AuthMiddleware or WorkspaceMiddleware; ' +
                'any request reaches it without authentication or membership checks.',
            parameters: [workspaceIdParam],
            responses: {
                '200': {
                    description: 'Current stub answer.',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/SuccessMessage' },
                            example: { ok: true, message: 'Channel' }
                        }
                    }
                },
                '500': { $ref: '#/components/responses/InternalServerError' }
            }
        }
    }
}
