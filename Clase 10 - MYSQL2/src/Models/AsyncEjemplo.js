/* 
En JS existen dos tipos de funciones --> Sincrónicas / Asincrónicas
    A simple vista, las diferenciamos porque en su declaración le ponemos async
*/

// No podemos usar async / await solos. Si está uno, tiene que estar el otro.
// Con fetch podemos emitir consultas HTTP. Fetch es una asincrónica que tarda algo de tiempo.
async function getUsers (){
    try {
        const result = await fetch(
            'https://jsonplaceholder.typicode.com/users',
            {
                method: 'GET'
            }
        )
        const fetchedContent = await result.json()
        console.log(fetchedContent) // Si no le ponemos await, estoy pidiendo la información de fetch en cosola sin que el fetch haya vuelto.
    } catch (error) {
        console.error("There was an error: ", error.message)
    }
}

/* En Js, las promesas se inventaron para poder manejar procesos asincrónicos. 
    Son objetos con un estado interno, que pueden ser:
        - Pending
        - Resolved --> Finalizó bien.
        - Rejected --> El proceso se intrrumpió y finalizó mal.
*/

export default getUsers