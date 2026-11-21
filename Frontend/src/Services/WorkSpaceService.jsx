const API_URL = import.meta.env.VITE_APP_URL_BACKEND

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
        throw new Error(`Server error (HTTP ${responseHttp.status})`)
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

export async function sendChannelMessage(workspaceId, channelId, content) {
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
                content: content
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

export async function sendDirectMessage(workspaceId, userId, content) {
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
                content: content
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
