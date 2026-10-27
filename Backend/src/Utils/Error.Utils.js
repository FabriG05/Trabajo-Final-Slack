/* No todos los errores son iguales. En back end, vamos a tener dos tipos de error:
    Incontrolables: No los podés preveer como programador (algún error que te hace explotar todo). API responde 500 Internal Server Error.
    Controlables: Si los podés contemplar (un mail duplicado, o algo que no cumple formato, etc). API responde con Status y Message.
*/

class ServerError extends Error{
    constructor(message, status){
        super(message)
        this.status = status
    }
}

export default ServerError


//Throw sirve para lanzar errores en JS.

/*  Tenemos estatus de respuesta. Sirven para saber cómo fue una consulta. Estos números son convenciones.
2.x.x: Cualquier cosa que empieza con 2, es que salió bien.
    200: Ok: todo salió bien.
    201: Creado: el recusro se creó correctamente.

4.x.x: Un error del lado de quién consulta (Client-side)
    400: Bad Request: Algo de tu lado salió mal. No sabemos qué, fijate.
    401: Unauthorized: No podés acceder sin autorización --> Podés hacer la acción desp de haber cumplido los requisitos.
    403: Forbidden: No tenés permiso para esta opercaión --> Bloqueo. No podés acceder a esta función.
    404: Not Found: Recurso no existente.

5.x.x: Un error del lado servidor (Server-side)
    500: Internal Server Error: Algo del server falló.
    502: Bad Gateway:  El server está mal enlazado.
    503: Service Unavailable: Servicio no disponible.
    504: Gateway Timeout: El tiempo de espera de respuesta se agotó.
    */