const API_URL = import.meta.env.VITE_APP_URL_BACKEND

export async function updateProfile(name, profilePhoto) {
    const authToken = localStorage.getItem('auth_token') || localStorage.getItem('authToken')
    const responseHttp = await fetch(
        API_URL + '/api/user/profile',
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                name: name,
                profile_photo: profilePhoto
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

export async function updateUserStatus(status) {
    const authToken = localStorage.getItem('auth_token') || localStorage.getItem('authToken')
    const responseHttp = await fetch(
        API_URL + '/api/user/status',
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + authToken
            },
            body: JSON.stringify({
                status: status
            })
        }
    )

    if (!responseHttp.ok) {
        throw new Error('Server error (HTTP ' + responseHttp.status + ')')
    }

    const responseBody = await responseHttp.json()

    if (!responseBody.ok) {
        throw new Error(responseBody.message)
    }

    return responseBody
}

export async function updateProfilePhoto(profilePhoto) {
    const authToken = localStorage.getItem('auth_token') || localStorage.getItem('authToken')
    const responseHttp = await fetch(
        API_URL + '/api/user/profile',
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + authToken
            },
            body: JSON.stringify({
                profile_photo: profilePhoto
            })
        }
    )

    if (!responseHttp.ok) {
        throw new Error('Server error (HTTP ' + responseHttp.status + ')')
    }

    const responseBody = await responseHttp.json()

    if (!responseBody.ok) {
        throw new Error(responseBody.message)
    }

    return responseBody
}

