/*
    Schemas for the /api/user endpoints and the user payloads embedded
    in auth responses. Shapes are derived from UserModel.js and from
    what UserService/UserRepository actually return.
*/

/*
    User document as returned by the API. The repositories strip the
    bcrypt hash, so `password` never appears in responses.
*/
export const User = {
    type: 'object',
    required: ['_id', 'name', 'email'],
    properties: {
        _id: { type: 'string', example: '674f1c9e2b8d3a0011223344', description: 'MongoDB ObjectId.' },
        name: { type: 'string', example: 'Fabri', description: 'Display name of the account.' },
        email: { type: 'string', format: 'email', example: 'someone@test.com' },
        profile_photo: {
            type: 'string',
            nullable: true,
            description: 'Base64 JPEG of the profile photo, or null when not set.'
        },
        created_at: { type: 'string', format: 'date-time', description: 'Account creation timestamp.' },
        active: { type: 'boolean', example: true, description: 'False when the account was deactivated.' },
        verified_email: { type: 'boolean', example: true, description: 'True once the email was verified.' }
    }
}

/*
    Public user payload embedded in the login response. It only carries
    id, name and email.
*/
export const LoginUser = {
    type: 'object',
    required: ['id', 'name', 'email'],
    properties: {
        id: { type: 'string', example: '674f1c9e2b8d3a0011223344' },
        name: { type: 'string', example: 'Fabri' },
        email: { type: 'string', format: 'email', example: 'someone@test.com' }
    }
}

/* Body of POST /api/auth/register. */
export const RegisterBody = {
    type: 'object',
    required: ['username', 'email', 'password'],
    properties: {
        username: { type: 'string', example: 'Fabri', description: 'Display name of the new account.' },
        email: { type: 'string', format: 'email', example: 'someone@test.com' },
        password: { type: 'string', example: 'S3curePass!', description: 'Plain password; stored as a bcrypt hash.' }
    }
}

/* Body of POST /api/auth/login. */
export const LoginBody = {
    type: 'object',
    required: ['email', 'password'],
    properties: {
        email: { type: 'string', format: 'email', example: 'someone@test.com' },
        password: { type: 'string', example: 'S3curePass!' }
    }
}

/* Body of PUT /api/user/profile. Both fields are optional; send only what changes. */
export const UpdateProfileBody = {
    type: 'object',
    properties: {
        name: { type: 'string', example: 'Fabri New Name', description: 'New display name; must not be empty.' },
        profile_photo: {
            type: 'string',
            nullable: true,
            example: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
            description: 'Base64 JPEG (max ~500 KB) or null to clear the photo.'
        }
    }
}

/* 200 payload of GET /api/user. */
export const UserListResponse = {
    type: 'object',
    required: ['message', 'ok', 'data'],
    properties: {
        message: { type: 'string', example: 'Get users list' },
        ok: { type: 'boolean', example: true },
        data: {
            type: 'object',
            required: ['users'],
            properties: {
                users: { type: 'array', items: { $ref: '#/components/schemas/User' } }
            }
        }
    }
}

/* 200 payload of GET /api/user/{user_id} and PUT /api/user/profile. */
export const UserResponse = {
    type: 'object',
    required: ['message', 'ok', 'data'],
    properties: {
        message: { type: 'string', example: 'Get user details successfully' },
        ok: { type: 'boolean', example: true },
        data: {
            type: 'object',
            required: ['user'],
            properties: {
                user: { $ref: '#/components/schemas/User' }
            }
        }
    }
}

/* 200 payload of POST /api/auth/login. */
export const LoginResponse = {
    type: 'object',
    required: ['ok', 'message', 'data'],
    properties: {
        ok: { type: 'boolean', example: true },
        message: { type: 'string', example: 'You have logged in successfully' },
        data: {
            type: 'object',
            required: ['token', 'user'],
            properties: {
                token: {
                    type: 'string',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NGY...',
                    description: 'JWT to send as `Authorization: Bearer <token>`.'
                },
                user: { $ref: '#/components/schemas/LoginUser' }
            }
        }
    }
}

export default { User, LoginUser, RegisterBody, LoginBody, UpdateProfileBody, UserListResponse, UserResponse, LoginResponse }
