/*
    Reusable OpenAPI components shared by every path group.

    - Envelope schemas (ErrorResponse / SuccessMessage): every endpoint
      answers with the same {ok, message} envelope.
    - bearerAuth: the JWT returned by POST /api/auth/login, sent as
      `Authorization: Bearer <token>`.
    - commonResponses: the status codes produced globally by
      AuthMiddleware, WorkspaceMiddleware and ErrorMiddleware, so each
      path only references them instead of repeating the payload.
*/

export const bearerAuth = {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description:
        'JWT signed with HS256 and returned by `POST /api/auth/login`. ' +
        'Send it on protected endpoints as: `Authorization: Bearer <token>`.'
}

/* Envelope of every error answer built by the error middleware. */
export const ErrorResponse = {
    type: 'object',
    required: ['ok', 'message'],
    properties: {
        ok: {
            type: 'boolean',
            example: false,
            description: 'Always false on error responses.'
        },
        message: {
            type: 'string',
            description: 'Human-readable explanation of what went wrong.'
        }
    }
}

/* Envelope of answers that only carry a confirmation message. */
export const SuccessMessage = {
    type: 'object',
    required: ['ok', 'message'],
    properties: {
        ok: {
            type: 'boolean',
            example: true,
            description: 'Always true on success responses.'
        },
        message: {
            type: 'string',
            description: 'Human-readable confirmation of the action.'
        }
    }
}

/*
    Builds one reusable response: status + description + the real
    JSON payload the API answers with.
*/
const errorResponse = (description, message) => ({
    description,
    content: {
        'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: { ok: false, message }
        }
    }
})

/*
    Common responses. The messages are the exact strings thrown by the
    middlewares and services, so consumers can rely on them.
*/
export const commonResponses = {
    /* AuthMiddleware: the request did not include an Authorization header. */
    AuthHeaderMissing: errorResponse(
        'Missing Authorization header (AuthMiddleware).',
        'Auth header is required.'
    ),

    /* AuthMiddleware: the header is not "Bearer <token>". */
    AuthHeaderMalformed: errorResponse(
        'The Authorization header is not "Bearer <token>" (AuthMiddleware).',
        'Auth token is required or malformed.'
    ),

    /* AuthMiddleware: jwt.verify rejected the token. */
    Unauthorized: errorResponse(
        'The JWT is invalid, malformed or expired (AuthMiddleware).',
        'Auth token is invalid.'
    ),

    /* WorkspaceMiddleware: the requester has no membership in the workspace. */
    ForbiddenNotMember: errorResponse(
        'The authenticated user is not a member of the workspace (WorkspaceMiddleware).',
        'You are not a member of this workspace'
    ),

    /* WorkspaceMiddleware: the membership role is not in the allowed list. */
    ForbiddenInsufficientPermissions: errorResponse(
        'The membership role does not allow this operation (WorkspaceMiddleware).',
        'You do not have enough permissions to perform this operation'
    ),

    /* ErrorMiddleware: any unexpected error, including JWT verification
       failures thrown inside the services (e.g. invalid or expired
       verification / reset tokens). */
    InternalServerError: errorResponse(
        'Unexpected server failure (ErrorMiddleware). Also returned when a signed token is invalid or expired.',
        'Internal Server Error'
    )
}

export default { bearerAuth, ErrorResponse, SuccessMessage, commonResponses }
