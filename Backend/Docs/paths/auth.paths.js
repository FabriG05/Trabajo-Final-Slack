/*
    Paths of /api/auth. All of them are public (no bearer token).
    Every response documented here is one the current implementation
    actually answers with; the 400 examples list each distinct message
    the services can throw for that endpoint.
*/

export default {
    '/api/auth/register': {
        post: {
            tags: ['Auth'],
            operationId: 'register',
            summary: 'Register a new user',
            description:
                'Creates a user with an unverified email and sends a verification email. ' +
                'The email is normalized (trimmed, lowercased) before lookup and storage. ' +
                'The account can log in, but must verify the email through the emailed link.',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/RegisterBody' }
                    }
                }
            },
            responses: {
                '201': {
                    description: 'User registered and verification email queued.',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/SuccessMessage' },
                            example: { ok: true, message: 'User registered successfully' }
                        }
                    }
                },
                '400': {
                    description:
                        'Validation failure. Any of the example messages below (ErrorMiddleware).',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                            examples: {
                                MissingFields: {
                                    summary: 'A field is missing, empty or not a string',
                                    value: { ok: false, message: 'Username, email and password are required' }
                                },
                                InvalidEmail: {
                                    summary: 'Email does not look like an email',
                                    value: { ok: false, message: 'Email is incorrect' }
                                },
                                DuplicateEmail: {
                                    summary: 'The email is already registered',
                                    value: { ok: false, message: 'Email is already used' }
                                }
                            }
                        }
                    }
                },
                '500': { $ref: '#/components/responses/InternalServerError' }
            }
        }
    },

    '/api/auth/login': {
        post: {
            tags: ['Auth'],
            operationId: 'login',
            summary: 'Log in',
            description:
                'Validates the credentials and returns a JWT plus the public payload of the user. ' +
                'The token does not expire and carries `{id, name, email}`; send it as ' +
                '`Authorization: Bearer <token>` on protected endpoints. Email verification is not required to log in.',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/LoginBody' }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Credentials accepted.',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/LoginResponse' }
                        }
                    }
                },
                '400': {
                    description: 'Validation failure (ErrorMiddleware).',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                            examples: {
                                MissingFields: {
                                    summary: 'A field is missing, empty or not a string',
                                    value: { ok: false, message: 'Email and password are required' }
                                },
                                InvalidEmail: {
                                    summary: 'Email does not look like an email',
                                    value: { ok: false, message: 'Email is incorrect' }
                                }
                            }
                        }
                    }
                },
                '401': {
                    description: 'The password does not match (AuthService).',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                            example: { ok: false, message: 'Invalid email or password' }
                        }
                    }
                },
                '404': {
                    description: 'No user exists with that email (AuthService).',
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

    '/api/auth/verify-email': {
        get: {
            tags: ['Auth'],
            operationId: 'verifyEmail',
            summary: 'Verify the email of an account',
            description:
                'Marks the account behind the token as verified. The token is a JWT signed for 1 day; ' +
                'it travels in the querystring because this endpoint is the target of the link inside ' +
                'the verification email: `/api/auth/verify-email?verification_token=<jwt>`.',
            parameters: [
                {
                    name: 'verification_token',
                    in: 'query',
                    required: true,
                    schema: { type: 'string' },
                    description: 'JWT sent in the verification email.'
                }
            ],
            responses: {
                '200': {
                    description: 'Email verified.',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/SuccessMessage' },
                            example: { ok: true, message: 'User verified successfully.' }
                        }
                    }
                },
                '400': {
                    description: 'The token was valid but the account cannot be verified (AuthService).',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                            examples: {
                                MissingToken: {
                                    summary: 'The query parameter was not sent',
                                    value: { ok: false, message: 'The verification token is missing' }
                                },
                                DeactivatedAccount: {
                                    summary: 'The account was deactivated',
                                    value: { ok: false, message: 'The account was deactivated. Contact the client support if you think this is a mistake.' }
                                },
                                AlreadyVerified: {
                                    summary: 'The email was already verified',
                                    value: { ok: false, message: 'You have already verified your account' }
                                },
                                InvalidToken: {
                                    summary: 'The token is malformed, has an invalid signature or expired',
                                    value: { ok: false, message: 'The verification token is invalid or expired' }
                                }
                            }
                        }
                    }
                },
                '404': {
                    description: 'The account behind the token no longer exists (AuthService).',
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

    '/api/auth/verify-email/{email}/resend': {
        get: {
            tags: ['Auth'],
            operationId: 'resendVerificationEmail',
            summary: 'Re-send the verification email',
            description:
                'Re-creates the verification token and re-sends the email when the account exists, is active ' +
                'and is still unverified. Anti-enumeration: the same 200 answer is returned whether or not ' +
                'the account exists, so consumers cannot infer anything from the response.',
            parameters: [
                {
                    name: 'email',
                    in: 'path',
                    required: true,
                    schema: { type: 'string', format: 'email' },
                    description: 'Email of the account that needs the verification email again.'
                }
            ],
            responses: {
                '200': {
                    description: 'Fixed answer, regardless of whether the account exists.',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/SuccessMessage' },
                            example: { ok: true, message: 'If this account exists, an email with the steps to verify it is on its way.' }
                        }
                    }
                },
                '400': {
                    description: 'Validation failure (AuthService).',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                            examples: {
                                MissingEmail: {
                                    summary: 'The email is not a string',
                                    value: { ok: false, message: 'Email is required' }
                                },
                                InvalidEmail: {
                                    summary: 'Email does not look like an email',
                                    value: { ok: false, message: 'Email is incorrect' }
                                }
                            }
                        }
                    }
                },
                '500': { $ref: '#/components/responses/InternalServerError' }
            }
        }
    },

    '/api/auth/forgot-password': {
        post: {
            tags: ['Auth'],
            operationId: 'forgotPassword',
            summary: 'Ask for a password-reset email',
            description:
                'Sends a reset email with a token valid for 1 hour when the account exists and is active. ' +
                'Anti-enumeration: the same 200 answer is returned whether or not the account exists.',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['email'],
                            properties: {
                                email: { type: 'string', format: 'email', example: 'someone@test.com' }
                            }
                        }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Fixed answer, regardless of whether the account exists.',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/SuccessMessage' },
                            example: { ok: true, message: 'If this account exists, an email with the steps to reset your password is on its way.' }
                        }
                    }
                },
                '400': {
                    description: 'Validation failure (AuthService).',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                            examples: {
                                MissingEmail: {
                                    summary: 'The email is missing or not a string',
                                    value: { ok: false, message: 'Email is required' }
                                },
                                InvalidEmail: {
                                    summary: 'Email does not look like an email',
                                    value: { ok: false, message: 'Email is incorrect' }
                                }
                            }
                        }
                    }
                },
                '500': { $ref: '#/components/responses/InternalServerError' }
            }
        }
    },

    '/api/auth/reset-password': {
        post: {
            tags: ['Auth'],
            operationId: 'resetPassword',
            summary: 'Reset the password with the emailed token',
            description:
                'Step 2 of the password reset: the token from the email link and the new password travel in the body. ' +
                'The token is a JWT signed for 1 hour; after a successful reset the old password no longer works.',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['reset_password_token', 'password'],
                            properties: {
                                reset_password_token: {
                                    type: 'string',
                                    description: 'JWT sent in the reset email.'
                                },
                                password: { type: 'string', example: 'N3wS3curePass!' }
                            }
                        }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Password updated.',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/SuccessMessage' },
                            example: { ok: true, message: 'Your password was reset successfully. You can now log in with your new password.' }
                        }
                    }
                },
                '400': {
                    description: 'Validation failure or deactivated account (AuthService).',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                            examples: {
                                MissingFields: {
                                    summary: 'Token or password missing / empty / not a string',
                                    value: { ok: false, message: 'Reset token and new password are required' }
                                },
                                DeactivatedAccount: {
                                    summary: 'The account was deactivated',
                                    value: { ok: false, message: 'The account was deactivated. Contact the client support if you think this is a mistake.' }
                                },
                                InvalidToken: {
                                    summary: 'The token is malformed, has an invalid signature or expired',
                                    value: { ok: false, message: 'The reset token is invalid or expired' }
                                }
                            }
                        }
                    }
                },
                '404': {
                    description: 'The account behind the token no longer exists (AuthService).',
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
