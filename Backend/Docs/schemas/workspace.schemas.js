/*
    Schemas for the /api/workspace endpoints. Shapes are derived from
    WorkSpaceModel.js, MemberModel.js and what WorkspaceService and the
    repositories actually return.
*/

/* Workspace document as returned by create / get / update / delete. */
export const Workspace = {
    type: 'object',
    required: ['_id', 'name'],
    properties: {
        _id: { type: 'string', example: '675a1c9e2b8d3a0044556677', description: 'MongoDB ObjectId.' },
        name: { type: 'string', example: 'My Workspace', description: 'Up to 50 characters.' },
        description: { type: 'string', example: 'Workspace for the team', description: 'Up to 200 characters.' },
        invite_link_token: {
            type: 'string',
            nullable: true,
            description: 'Token of the shareable invitation link; any logged-in user who opens the join page with it becomes a member.'
        },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
    }
}

/*
    Member embedded in every workspace of the list endpoint: only the
    active members (invitation accepted, user still active), with just
    their name and role.
*/
export const MemberSummary = {
    type: 'object',
    required: ['name', 'role'],
    properties: {
        name: { type: 'string', example: 'Fabri' },
        role: { type: 'string', enum: ['User', 'Admin', 'Owner'], example: 'Owner' }
    }
}

/*
    Entry of GET /api/workspace: the user's workspace plus its active
    members. `created_at` keeps the field name used by the service.
*/
export const WorkspaceListItem = {
    type: 'object',
    required: ['_id', 'name', 'members'],
    properties: {
        _id: { type: 'string', example: '675a1c9e2b8d3a0044556677' },
        name: { type: 'string', example: 'My Workspace' },
        description: { type: 'string', example: 'Workspace for the team' },
        created_at: { type: 'string', format: 'date-time' },
        members: { type: 'array', items: { $ref: '#/components/schemas/MemberSummary' } }
    }
}

/* Membership document as returned by GET members / delete member / owner membership. */
export const Member = {
    type: 'object',
    required: ['_id', 'FK_id_user', 'FK_id_workspace', 'role'],
    properties: {
        _id: { type: 'string', example: '675b1c9e2b8d3a00778899aa', description: 'MongoDB ObjectId of the membership.' },
        FK_id_user: {
            type: 'object',
            description: 'When populated (workspace members list): {_id, name, email, active}. Raw ObjectId string in other cases.',
            properties: {
                _id: { type: 'string', example: '674f1c9e2b8d3a0011223344' },
                name: { type: 'string', example: 'Fabri' },
                email: { type: 'string', format: 'email', example: 'someone@test.com' },
                active: { type: 'boolean', example: true }
            }
        },
        FK_id_workspace: { type: 'string', example: '675a1c9e2b8d3a0044556677', description: 'Workspace the membership belongs to. Populated (with name) only inside the workspace list.' },
        role: { type: 'string', enum: ['User', 'Admin', 'Owner'], example: 'User' },
        invitation_token: {
            type: 'string',
            nullable: true,
            description: 'Hex token used to accept the invitation; null once accepted.'
        },
        invitationAccepted: { type: 'boolean', example: false, description: 'True after the invitation was accepted.' },
        invitationExpiresAt: { type: 'string', format: 'date-time', nullable: true, description: 'Invitations expire 7 days after creation.' },
        created_at: { type: 'string', format: 'date-time' }
    }
}

/* Summary returned by POST /{workspace_id}/invitations: one bucket per outcome. */
export const InvitationSummary = {
    type: 'object',
    required: ['invited', 'not_found', 'already_members'],
    properties: {
        invited: {
            type: 'array',
            items: { type: 'string', format: 'email' },
            description: 'Emails for which a pending invitation was created (an email with the accept link is sent to each one).'
        },
        not_found: {
            type: 'array',
            items: { type: 'string', format: 'email' },
            description: 'Emails that could not be invited for an unexpected reason (normally empty: emails without an active account are invited through the Invitation collection).'
        },
        already_members: {
            type: 'array',
            items: { type: 'string', format: 'email' },
            description: 'Emails that already hold a membership, or already have a pending invitation, in the workspace.'
        },
        email_failed: {
            type: 'array',
            items: { type: 'string', format: 'email' },
            description: 'Emails whose invitation was created but whose invitation email could not be sent.'
        }
    }
}

/* Body of POST /api/workspace. */
export const CreateWorkspaceBody = {
    type: 'object',
    required: ['name'],
    properties: {
        name: { type: 'string', example: 'My Workspace', description: 'Required, max 50 characters.' },
        description: { type: 'string', example: 'Workspace for the team', description: 'Optional, max 200 characters.' }
    }
}

/* Body of PUT /api/workspace/{workspace_id}. Both fields are optional. */
export const UpdateWorkspaceBody = {
    type: 'object',
    properties: {
        name: { type: 'string', example: 'My Workspace Renamed', description: 'Max 50 characters; empty string fails validation.' },
        description: { type: 'string', example: 'New description', description: 'Max 200 characters.' }
    }
}

/* Body of POST /{workspace_id}/invitations. */
export const InvitationsBody = {
    type: 'object',
    required: ['emails'],
    properties: {
        emails: {
            type: 'array',
            items: { type: 'string', format: 'email' },
            example: ['someone@test.com', 'other@test.com'],
            description: 'Non-empty array of valid email addresses; duplicates are removed.'
        }
    }
}

/* Body of POST /{workspace_id}/join. */
export const JoinBody = {
    type: 'object',
    required: ['invitation_token'],
    properties: {
        invitation_token: {
            type: 'string',
            example: '9f1c2a7b8d3e4f5061728394a5b6c7d8',
            description: 'Workspace-level invite link token, or the personal token of a pending invitation received by email.'
        }
    }
}

/* 200 payload of POST /{workspace_id}/join. */
export const JoinResponse = {
    type: 'object',
    required: ['ok', 'message', 'data'],
    properties: {
        ok: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Invitation accepted successfully.' },
        data: {
            type: 'object',
            required: ['joinSummary'],
            properties: {
                joinSummary: {
                    type: 'object',
                    required: ['joined', 'already_member', 'workspace_name'],
                    properties: {
                        joined: { type: 'boolean', example: true },
                        already_member: {
                            type: 'boolean',
                            example: false,
                            description: 'True when the user already was a member of the workspace.'
                        },
                        workspace_name: { type: 'string', example: 'My Workspace' }
                    }
                }
            }
        }
    }
}

/* 200 payload of GET /api/workspace. */
export const WorkspaceListResponse = {
    type: 'object',
    required: ['ok', 'message', 'status', 'data'],
    properties: {
        ok: { type: 'boolean', example: true },
        message: { type: 'string', example: 'All data retrieved successfully' },
        status: { type: 'integer', example: 200 },
        data: {
            type: 'object',
            required: ['obtainedWorkspaces'],
            properties: {
                obtainedWorkspaces: { type: 'array', items: { $ref: '#/components/schemas/WorkspaceListItem' } }
            }
        }
    }
}

/* 201 payload of POST /api/workspace: the workspace and the Owner membership of the creator. */
export const CreateWorkspaceResponse = {
    type: 'object',
    required: ['ok', 'message', 'data'],
    properties: {
        ok: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Everything is fine so far' },
        data: {
            type: 'object',
            required: ['createdWorkspace', 'ownerMembership'],
            properties: {
                createdWorkspace: { $ref: '#/components/schemas/Workspace' },
                ownerMembership: { $ref: '#/components/schemas/Member' }
            }
        }
    }
}

/*
    200 payload of get / update / delete workspace. The data key names
    the retrieved object: selectedWorkspace / updatedWorkspace /
    deletedWorkspace.
*/
export const WorkspaceResponse = {
    type: 'object',
    required: ['ok', 'message', 'data'],
    properties: {
        ok: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Workspace retrieved successfully' },
        data: {
            type: 'object',
            required: ['selectedWorkspace'],
            properties: {
                selectedWorkspace: { $ref: '#/components/schemas/Workspace' }
            }
        }
    }
}

/* 200 payload of GET /{workspace_id}/members. */
export const MembersResponse = {
    type: 'object',
    required: ['ok', 'message', 'data'],
    properties: {
        ok: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Members retrieved successfully.' },
        data: {
            type: 'object',
            required: ['members'],
            properties: {
                members: { type: 'array', items: { $ref: '#/components/schemas/Member' } }
            }
        }
    }
}

/* 200 payload of DELETE /{workspace_id}/members/{member_id}. `deletedMember` is null when the id does not exist. */
export const DeleteMemberResponse = {
    type: 'object',
    required: ['ok', 'message', 'data'],
    properties: {
        ok: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Member deleted successfully.' },
        data: {
            type: 'object',
            required: ['deletedMember'],
            properties: {
                deletedMember: { $ref: '#/components/schemas/Member' }
            }
        }
    }
}

/* 201 payload of POST /{workspace_id}/invitations. */
export const InvitationSummaryResponse = {
    type: 'object',
    required: ['ok', 'message', 'data'],
    properties: {
        ok: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Invitations processed successfully.' },
        data: {
            type: 'object',
            required: ['invitationSummary'],
            properties: {
                invitationSummary: { $ref: '#/components/schemas/InvitationSummary' }
            }
        }
    }
}

export default {
    Workspace, MemberSummary, WorkspaceListItem, Member, InvitationSummary,
    CreateWorkspaceBody, UpdateWorkspaceBody, InvitationsBody, JoinBody, JoinResponse,
    WorkspaceListResponse, CreateWorkspaceResponse, WorkspaceResponse,
    MembersResponse, DeleteMemberResponse, InvitationSummaryResponse
}
