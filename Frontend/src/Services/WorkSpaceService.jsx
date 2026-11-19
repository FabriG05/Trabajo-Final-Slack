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

export async function inviteMembers(workspaceId, emails) {
    const authToken = localStorage.getItem('auth_token') || localStorage.getItem('authToken')
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
