const API_URL = import.meta.env.VITE_APP_URL_BACKEND

export async function createWorkspace(name, description) {
    const authToken = localStorage.getItem('auth_token') || localStorage.getItem('authToken')
    const responseHttp = await fetch(
        API_URL + '/api/workspaces',
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
    const responseBody = await responseHttp.json()

    if (!responseBody.ok) {
        throw new Error(responseBody.message)
    }

    return responseBody
}

export async function getAllWorkspaces() {
    const authToken = localStorage.getItem('auth_token') || localStorage.getItem('authToken')
    const responseHttp = await fetch(
        API_URL + '/api/workspaces',
        {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        }
    )
    const responseBody = await responseHttp.json()

    if (!responseBody.ok) {
        throw new Error(responseBody.message)
    }

    return responseBody
}
