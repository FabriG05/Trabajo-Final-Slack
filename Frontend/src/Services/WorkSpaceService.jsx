const API_URL = import.meta.env.VITE_APP_URL_BACKEND

/*
    Builds the Error thrown when a request fails. It keeps the backend
    message (for example "The #general channel cannot be deleted.") and
    the HTTP status, so callers can react to 403/404 specifically.
*/
async function buildResponseError(responseHttp) {
    let message = `Server error (HTTP ${responseHttp.status})`

    try {
        const responseBody = await responseHttp.json()

        if (responseBody?.message) {
            message = responseBody.message
        }
    } catch {
        // The body was not JSON: keep the generic message.
    }

    const error = new Error(message)
    error.status = responseHttp.status
    return error
}

export async function createWorkspace(name, description) {
    const authToken = localStorage.getItem('auth_token') || localStorage.getItem('authToken')
    const responseHttp = await fetch(
        API_URL + '/api/workspace',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                name: name,
                description: description
            })
        }
    )

    if (!responseHttp.ok) {
        throw new Error(`Server error (HTTP ${responseHttp.status})`)
    }

    const responseBody = await responseHttp.json()

    if (!responseBody.ok) {
        throw new Error(responseBody.message)
    }

    return responseBody
}

export async function getAllWorkspaces() {
    const authToken = localStorage.getItem('auth_token') || localStorage.getItem('authToken')
    const responseHttp = await fetch(
        API_URL + '/api/workspace',
        {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        }
    )

    if (!responseHttp.ok) {
        throw new Error(`Server error (HTTP ${responseHttp.status})`)
    }

    const responseBody = await responseHttp.json()

    if (!responseBody.ok) {
        throw new Error(responseBody.message)
    }

    return responseBody
}

export async function getWorkspaceById(workspaceId) {
    const authToken = localStorage.getItem('auth_token') || localStorage.getItem('authToken')
    const responseHttp = await fetch(
        API_URL + `/api/workspace/${workspaceId}`,
        {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        }
    )

    if (!responseHttp.ok) {
        throw new Error(`Server error (HTTP ${responseHttp.status})`)
    }

    const responseBody = await responseHttp.json()

    if (!responseBody.ok) {
        throw new Error(responseBody.message)
    }

    return responseBody
}

export async function getWorkspaceMembers(workspaceId) {
    const authToken = localStorage.getItem('auth_token') || localStorage.getItem('authToken')
    const responseHttp = await fetch(
        API_URL + `/api/workspace/${workspaceId}/members`,
        {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        }
    )

    if (!responseHttp.ok) {
        throw new Error(`Server error (HTTP ${responseHttp.status})`)
    }

    const responseBody = await responseHttp.json()

    if (!responseBody.ok) {
        throw new Error(responseBody.message)
    }

    return responseBody
}

/*
    Joins the workspace behind an invitation link. The token is either
    the workspace-level invite link token or a personal invitation token
    received by email.
*/
export async function joinWorkspace(workspaceId, invitationToken) {
    const authToken = localStorage.getItem('auth_token') || localStorage.getItem('authToken')
    const responseHttp = await fetch(
        API_URL + `/api/workspace/${workspaceId}/join`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                invitation_token: invitationToken
            })
        }
    )

    if (!responseHttp.ok) {
        throw new Error(`Server error (HTTP ${responseHttp.status})`)
    }

    const responseBody = await responseHttp.json()

    if (!responseBody.ok) {
        throw new Error(responseBody.message)
    }

    return responseBody
}

export async function inviteMembers(workspaceId, emails) {    const authToken = localStorage.getItem('auth_token') || localStorage.getItem('authToken')
    const responseHttp = await fetch(
        API_URL + `/api/workspace/${workspaceId}/invitations`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                emails: emails
            })
        }
    )

    if (!responseHttp.ok) {
        throw new Error(`Server error (HTTP ${responseHttp.status})`)
    }

    const responseBody = await responseHttp.json()

    if (!responseBody.ok) {
        throw new Error(responseBody.message)
    }

    return responseBody
}

/* Channels of a workspace. */
export async function getChannels(workspaceId) {
    const authToken = localStorage.getItem('auth_token') || localStorage.getItem('authToken')
    const responseHttp = await fetch(
        API_URL + `/api/workspace/${workspaceId}/channels`,
        {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        }
    )

    if (!responseHttp.ok) {
        throw new Error(`Server error (HTTP ${responseHttp.status})`)
    }

    const responseBody = await responseHttp.json()

    if (!responseBody.ok) {
        throw new Error(responseBody.message)
    }

    return responseBody
}

/* Creates a channel. The server normalizes the name and rejects duplicates. */
export async function createChannel(workspaceId, name) {
    const authToken = localStorage.getItem('auth_token') || localStorage.getItem('authToken')
    const responseHttp = await fetch(
        API_URL + `/api/workspace/${workspaceId}/channels`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                name: name
            })
        }
    )

    if (!responseHttp.ok) {
        throw new Error(`Server error (HTTP ${responseHttp.status})`)
    }

    const responseBody = await responseHttp.json()

    if (!responseBody.ok) {
        throw new Error(responseBody.message)
    }

    return responseBody
}

export async function deleteChannel(workspaceId, channelId) {
    const authToken = localStorage.getItem('auth_token') || localStorage.getItem('authToken')
    const responseHttp = await fetch(
        API_URL + `/api/workspace/${workspaceId}/channels/${channelId}`,
        {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        }
    )

    if (!responseHttp.ok) {
        throw await buildResponseError(responseHttp)
    }

    const responseBody = await responseHttp.json()

    if (!responseBody.ok) {
        throw new Error(responseBody.message)
    }

    return responseBody
}

/* Deletes one message of a channel or a direct conversation. */
export async function deleteMessage(workspaceId, messageId) {
    const authToken = localStorage.getItem('auth_token') || localStorage.getItem('authToken')
    const responseHttp = await fetch(
        API_URL + `/api/workspace/${workspaceId}/messages/${messageId}`,
        {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        }
    )

    if (!responseHttp.ok) {
        throw await buildResponseError(responseHttp)
    }

    const responseBody = await responseHttp.json()

    if (!responseBody.ok) {
        throw new Error(responseBody.message)
    }

    return responseBody
}

/* Edits the text of a message (author only). */
export async function updateMessage(workspaceId, messageId, content) {
    const authToken = localStorage.getItem('auth_token') || localStorage.getItem('authToken')
    const responseHttp = await fetch(
        API_URL + `/api/workspace/${workspaceId}/messages/${messageId}`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ content })
        }
    )

    if (!responseHttp.ok) {
        throw await buildResponseError(responseHttp)
    }

    const responseBody = await responseHttp.json()

    if (!responseBody.ok) {
        throw new Error(responseBody.message)
    }

    return responseBody
}

/* Deletes the whole workspace (owner only). */
export async function deleteWorkspace(workspaceId) {
    const authToken = localStorage.getItem('auth_token') || localStorage.getItem('authToken')
    const responseHttp = await fetch(
        API_URL + `/api/workspace/${workspaceId}`,
        {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        }
    )

    if (!responseHttp.ok) {
        throw new Error(`Server error (HTTP ${responseHttp.status})`)
    }

    const responseBody = await responseHttp.json()

    if (!responseBody.ok) {
        throw new Error(responseBody.message)
    }

    return responseBody
}

/* Renames the workspace (Owner/Admin). */
export async function updateWorkspace(workspaceId, name) {
    const authToken = localStorage.getItem('auth_token') || localStorage.getItem('authToken')
    const responseHttp = await fetch(
        API_URL + `/api/workspace/${workspaceId}`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ name })
        }
    )

    if (!responseHttp.ok) {
        throw await buildResponseError(responseHttp)
    }

    const responseBody = await responseHttp.json()

    if (!responseBody.ok) {
        throw new Error(responseBody.message)
    }

    return responseBody
}

/* Removes a member from the workspace (Owner/Admin). */
export async function deleteWorkspaceMember(workspaceId, memberId) {
    const authToken = localStorage.getItem('auth_token') || localStorage.getItem('authToken')
    const responseHttp = await fetch(
        API_URL + `/api/workspace/${workspaceId}/members/${memberId}`,
        {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        }
    )

    if (!responseHttp.ok) {
        throw await buildResponseError(responseHttp)
    }

    const responseBody = await responseHttp.json()

    if (!responseBody.ok) {
        throw new Error(responseBody.message)
    }

    return responseBody
}

/* Changes a member role (Owner/Admin). */
export async function updateMemberRole(workspaceId, memberId, role) {
    const authToken = localStorage.getItem('auth_token') || localStorage.getItem('authToken')
    const responseHttp = await fetch(
        API_URL + `/api/workspace/${workspaceId}/members/${memberId}/role`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ role })
        }
    )

    if (!responseHttp.ok) {
        throw await buildResponseError(responseHttp)
    }

    const responseBody = await responseHttp.json()

    if (!responseBody.ok) {
        throw new Error(responseBody.message)
    }

    return responseBody
}

/* Messages of a channel, oldest first. */
export async function getChannelMessages(workspaceId, channelId) {
    const authToken = localStorage.getItem('auth_token') || localStorage.getItem('authToken')
    const responseHttp = await fetch(
        API_URL + `/api/workspace/${workspaceId}/channels/${channelId}/messages`,
        {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        }
    )

    if (!responseHttp.ok) {
        throw new Error(`Server error (HTTP ${responseHttp.status})`)
    }

    const responseBody = await responseHttp.json()

    if (!responseBody.ok) {
        throw new Error(responseBody.message)
    }

    return responseBody
}

export async function sendChannelMessage(workspaceId, channelId, content, attachment = null) {
    const authToken = localStorage.getItem('auth_token') || localStorage.getItem('authToken')
    const responseHttp = await fetch(
        API_URL + `/api/workspace/${workspaceId}/channels/${channelId}/messages`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                content: content,
                attachment
            })
        }
    )

    if (!responseHttp.ok) {
        throw new Error(`Server error (HTTP ${responseHttp.status})`)
    }

    const responseBody = await responseHttp.json()

    if (!responseBody.ok) {
        throw new Error(responseBody.message)
    }

    return responseBody
}

/* Unread counts per conversation, rebuilt from the persisted read state. */
export async function getUnreadCounts(workspaceId) {
    const authToken = localStorage.getItem('auth_token') || localStorage.getItem('authToken')
    const responseHttp = await fetch(
        API_URL + `/api/workspace/${workspaceId}/unread`,
        {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        }
    )

    if (!responseHttp.ok) {
        throw new Error(`Server error (HTTP ${responseHttp.status})`)
    }

    const responseBody = await responseHttp.json()

    if (!responseBody.ok) {
        throw new Error(responseBody.message)
    }

    return responseBody
}

/* Persist that a conversation was read by the signed-in user. */
export async function markConversationRead(workspaceId, conversationKey, type) {
    const authToken = localStorage.getItem('auth_token') || localStorage.getItem('authToken')
    const responseHttp = await fetch(
        API_URL + `/api/workspace/${workspaceId}/reads/${conversationKey}`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ type })
        }
    )

    if (!responseHttp.ok) {
        throw new Error(`Server error (HTTP ${responseHttp.status})`)
    }

    const responseBody = await responseHttp.json()

    if (!responseBody.ok) {
        throw new Error(responseBody.message)
    }

    return responseBody
}

/* Starred/saved messages for the signed-in user. */
export async function getStarredMessages(workspaceId) {
    const authToken = localStorage.getItem('auth_token') || localStorage.getItem('authToken')
    const responseHttp = await fetch(
        API_URL + `/api/workspace/${workspaceId}/starred`,
        {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        }
    )

    if (!responseHttp.ok) {
        throw await buildResponseError(responseHttp)
    }

    const responseBody = await responseHttp.json()

    if (!responseBody.ok) {
        throw new Error(responseBody.message)
    }

    return responseBody
}

export async function starMessage(workspaceId, messageId) {
    const authToken = localStorage.getItem('auth_token') || localStorage.getItem('authToken')
    const responseHttp = await fetch(
        API_URL + `/api/workspace/${workspaceId}/starred/${messageId}`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        }
    )

    if (!responseHttp.ok) {
        throw await buildResponseError(responseHttp)
    }

    const responseBody = await responseHttp.json()

    if (!responseBody.ok) {
        throw new Error(responseBody.message)
    }

    return responseBody
}

export async function unstarMessage(workspaceId, messageId) {
    const authToken = localStorage.getItem('auth_token') || localStorage.getItem('authToken')
    const responseHttp = await fetch(
        API_URL + `/api/workspace/${workspaceId}/starred/${messageId}`,
        {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        }
    )

    if (!responseHttp.ok) {
        throw await buildResponseError(responseHttp)
    }

    const responseBody = await responseHttp.json()

    if (!responseBody.ok) {
        throw new Error(responseBody.message)
    }

    return responseBody
}

/* Activity feed: channel messages that mention the signed-in user. */
export async function getActivity(workspaceId) {
    const authToken = localStorage.getItem('auth_token') || localStorage.getItem('authToken')
    const responseHttp = await fetch(
        API_URL + `/api/workspace/${workspaceId}/activity`,
        {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        }
    )

    if (!responseHttp.ok) {
        throw new Error(`Server error (HTTP ${responseHttp.status})`)
    }

    const responseBody = await responseHttp.json()

    if (!responseBody.ok) {
        throw new Error(responseBody.message)
    }

    return responseBody
}

/* Latest direct message per conversation partner, for the DMs screen. */
export async function getDirectMessageSummaries(workspaceId) {
    const authToken = localStorage.getItem('auth_token') || localStorage.getItem('authToken')
    const responseHttp = await fetch(
        API_URL + `/api/workspace/${workspaceId}/direct-messages`,
        {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        }
    )

    if (!responseHttp.ok) {
        throw new Error(`Server error (HTTP ${responseHttp.status})`)
    }

    const responseBody = await responseHttp.json()

    if (!responseBody.ok) {
        throw new Error(responseBody.message)
    }

    return responseBody
}

/* Direct message conversation with another member of the workspace. */
export async function getDirectMessages(workspaceId, userId) {
    const authToken = localStorage.getItem('auth_token') || localStorage.getItem('authToken')
    const responseHttp = await fetch(
        API_URL + `/api/workspace/${workspaceId}/direct-messages/${userId}`,
        {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        }
    )

    if (!responseHttp.ok) {
        throw new Error(`Server error (HTTP ${responseHttp.status})`)
    }

    const responseBody = await responseHttp.json()

    if (!responseBody.ok) {
        throw new Error(responseBody.message)
    }

    return responseBody
}

export async function sendDirectMessage(workspaceId, userId, content, attachment = null) {
    const authToken = localStorage.getItem('auth_token') || localStorage.getItem('authToken')
    const responseHttp = await fetch(
        API_URL + `/api/workspace/${workspaceId}/direct-messages/${userId}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                content: content,
                attachment
            })
        }
    )

    if (!responseHttp.ok) {
        throw new Error(`Server error (HTTP ${responseHttp.status})`)
    }

    const responseBody = await responseHttp.json()

    if (!responseBody.ok) {
        throw new Error(responseBody.message)
    }

    return responseBody
}
