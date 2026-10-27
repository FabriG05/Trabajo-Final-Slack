
export async function logIn(email, password) {
    try {
        const responseHTTP = await fetch(
            'http://localhost:8080/api/auth/login',
            {
                method: 'POST',
                headers: {
                    'Content-Type': "application/json" //Le decimos al servidor qué tipo de dato estamos enviando.
                },
                body: JSON.stringify({  //Sive para transformar un objeto de Js en un JSON.
                    email: email,
                    password: password
                })
            }
        )
        const responseBody = await responseHTTP.json()
        console.log(responseBody)
    } catch (error) {
        console.log(error)
    }
}

logIn('test1@gmail.com', "Test1123")