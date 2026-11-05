const API_URL = import.meta.env.VITE_APP_URL_BACKEND

export async function login(email, password) {
    const responseHttp = await fetch(
        API_URL + '/api/auth/login',
        {
            method: 'POST',
            headers: {
                'Content-Type': "application/json" //Le decimos al servidor qué tipo de dato estamos enviando.
            },
            body: JSON.stringify({ //Sive para transformar un objeto de Js en un JSON.
                email: email,
                password: password
            })
        }
    )
    const responseBody = await responseHttp.json()

    if (!responseBody.ok) {
        throw new Error(responseBody.message)
    }

    return responseBody
}

export const logIn = login

export async function register(username, email, password) {
    const responseHttp = await fetch(
        API_URL + '/api/auth/register',
        {
            method: 'POST',
            headers: {
                'Content-Type': "application/json"
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password
            })
        }
    )
    //Leemos el cuerpo de la respuesta como un JSON.
    const responseBody = await responseHttp.json()

    if (!responseBody.ok) {
        throw new Error(responseBody.message)
    }

    return responseBody
}
