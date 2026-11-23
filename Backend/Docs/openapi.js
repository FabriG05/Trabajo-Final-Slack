import authPaths from './paths/auth.paths.js'
import userPaths from './paths/user.paths.js'
import workspacePaths from './paths/workspace.paths.js'
import channelPaths from './paths/channel.paths.js'
import messagePaths from './paths/message.paths.js'
import { bearerAuth, ErrorResponse, SuccessMessage, commonResponses } from './schemas/common.schemas.js'
import {
    User, LoginUser, RegisterBody, LoginBody, UpdateProfileBody, UpdateStatusBody,
    UserListResponse, UserResponse, LoginResponse
} from './schemas/user.schemas.js'
import {
    Workspace, MemberSummary, WorkspaceListItem, Member, InvitationSummary,
    CreateWorkspaceBody, UpdateWorkspaceBody, InvitationsBody, JoinBody, JoinResponse,
    WorkspaceListResponse, CreateWorkspaceResponse, GetWorkspaceResponse,
    UpdateWorkspaceResponse, DeleteWorkspaceResponse,
    MembersResponse, DeleteMemberResponse, InvitationSummaryResponse
} from './schemas/workspace.schemas.js'
import channelSchemas from './schemas/channel.schemas.js'
import messageSchemas from './schemas/message.schemas.js'

const openapiSpec = {
    openapi: '3.0.3',

    info: {
        title: 'Slack Clone API',
        version: '1.0.0',
        description:
            'REST API of the Slack clone: authentication with email verification and password reset, ' +
            'user profiles and workspaces with members and invitations.\n\n' +
            'Every response uses a JSON envelope: errors are `{ok: false, message}` and successes ' +
            'either `{ok: true, message}` or `{ok: true, message, data}`.\n\n' +
            'Protected endpoints expect the JWT returned by `POST /api/auth/login` as ' +
            '`Authorization: Bearer <token>`.'
    },

    servers: [
        {
            url: 'http://localhost:8080',
            description: 'Local development server'
        }
    ],

    tags: [
        { name: 'Auth', description: 'Registration, login, email verification and password reset.' },
        { name: 'Users', description: 'User listing and profile management.' },
        { name: 'Workspaces', description: 'Workspaces, members and invitations.' },
        { name: 'Channels', description: 'Workspace channels.' },
        { name: 'Messages', description: 'Channel messages, DMs, unread/read state and activity.' }
    ],

    components: {
        securitySchemes: {
            bearerAuth
        },
        schemas: {
            ErrorResponse,
            SuccessMessage,
            User,
            LoginUser,
            RegisterBody,
            LoginBody,
            UpdateProfileBody,
            UpdateStatusBody,
            UserListResponse,
            UserResponse,
            LoginResponse,
            Workspace,
            MemberSummary,
            WorkspaceListItem,
            Member,
            InvitationSummary,
            CreateWorkspaceBody,
            UpdateWorkspaceBody,
            InvitationsBody,
            JoinBody,
            JoinResponse,
            WorkspaceListResponse,
            CreateWorkspaceResponse,
            GetWorkspaceResponse,
            UpdateWorkspaceResponse,
            DeleteWorkspaceResponse,
            MembersResponse,
            DeleteMemberResponse,
            InvitationSummaryResponse,
            ...channelSchemas,
            ...messageSchemas
        },
        responses: commonResponses
    },

    paths: {
        ...authPaths,
        ...userPaths,
        ...workspacePaths,
        ...channelPaths,
        ...messagePaths
    }
}

export default openapiSpec
