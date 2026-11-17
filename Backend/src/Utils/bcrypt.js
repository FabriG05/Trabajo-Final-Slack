import bcrypt from "bcrypt";

export async function generateHash(data) {
    const hash = await bcrypt.hash(data, 12)
    return hash
}

/* It receives data and the number of times the password is "mixed" / "hashed". 
The higher the number, the more "rounds" and the longer the process takes. 
If something is SUPER sensitive, put a high number. Usually 12, 13, 14 is fine. */

export async function compareHash(data, hash) {
    const result = await bcrypt.compare(data, hash) //It allows us to know if a hash belongs to a specific data.
    console.log("result: true", result)
    return result
}
