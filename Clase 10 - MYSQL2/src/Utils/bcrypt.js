import bcrypt from "bcrypt";

export async function generateHash(data) {
    const hash = await bcrypt.hash(data, 12) 
    return hash
}

/* Recibe un dato y la cantidad de veces que se "mezcla" la contraseña. 
Mientras más alto el número,"vueltas / rondas" y más tarda el proceso. 
Si algo es SÚPER sencible, si poner un número alto. Lo normal, 12, 13, 14 está bien. */

export async function compareHash(data, hash){
    const result = await bcrypt.compare(data, hash) //Nos permite saber si un hash pertenece a un x dato.
    console.log("result:", result)
}

