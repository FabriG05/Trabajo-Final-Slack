import pool from "../Config/MySQL.config.js"

/* 
Un repository es donde manejamos la comunicación con nuestros datos --> Generalmente la DB  
Siempre que podamos, usemos filtros del lado de la base de datos. Son mucho más óptimos que un for of... 
*/

class UserRepository {
    async create(name, email, password) {
        const sqlQuery = 'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)'
        //Nos devuelve los valores a inyectar en la query y devuelve un array con el resultado y las tablas.
        const [result] = await pool.execute(
            sqlQuery,
            [name, email, password]
        )
        console.log('[UserRepository.create]:', result)
        //Retornamos el id del usuario insertado
        return { id: result.insertId, username: name, email }
    }

    async get() {
        const [result] = await pool.execute('SELECT * FROM users')
        const formattedUsers = result.map(
            (user) => {
                return {
                    _id: user.id,
                    name: user.username,
                    email: user.email,
                    password: user.password_hash,
                    active: user.active
                }
            }
        )
        return formattedUsers
    }

    async getByCreationDate(minDate, maxDate) {
        const sqlQuery = 'SELECT * FROM users WHERE created_at >= ? AND created_at < ?'
        const [result] = await pool.execute(sqlQuery, [minDate, maxDate])
        console.log(result)
        return result
    }

    async getByName(name) {
        const sqlQuery = 'SELECT * FROM users WHERE username = ? AND active = TRUE'
        const [result] = await pool.execute(sqlQuery, [name])
        return result
    }

    async getBySearchTerm(term) {
        const sqlQuery = 'SELECT * FROM users WHERE username LIKE ? AND active = TRUE'
        const [result] = await pool.execute(sqlQuery, [`%${term}%`])
        return result
    }

    async getById(userId) {
        const sqlQuery = 'SELECT * FROM users WHERE id = ?'
        const [result] = await pool.execute(sqlQuery, [userId])
        if (result.length === 0) {
            return null
        }
        const user = result[0]
        return {
            _id: user.id,
            name: user.username,
            email: user.email,
            password: user.password_hash,
            active: user.active
        }
    }

    async getByEmail(email) {
        const sqlQuery = 'SELECT * FROM users WHERE email = ?'
        const [result] = await pool.execute(sqlQuery, [email])
        if (result.length === 0) {
            return null //Te devuelve Null si no encuentra o un objeto con el resultado. 
        }
        const user = result[0]
        return {
            _id: user.id,
            name: user.username,
            email: user.email,
            password: user.password_hash,
            active: user.active,
            verified_email: user.verified_email ?? false
        }
    }

    async deleteById(userId) {
        const sqlQuery = 'DELETE FROM users WHERE id = ?'
        const [result] = await pool.execute(sqlQuery, [userId])
        return result
    }

    async softDeleteById(userId) {
        const sqlQuery = 'UPDATE users SET active = FALSE WHERE id = ?'
        const [result] = await pool.execute(sqlQuery, [userId])
        return result
    }

    async updateById(userId, data) {
        //Construimos el SET dinámicamente según los campos que vengan en data
        const fields = []
        const values = []

        if (data.verified_email !== undefined || data.verifyEmail !== undefined) {
            fields.push('verified_email = ?')
            values.push(true)
        }

        if (fields.length === 0) {
            return null
        }

        values.push(userId)
        const sqlQuery = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`
        const [result] = await pool.execute(sqlQuery, values)
        return result
    }
}

//EL UserRepository es un singleton --> solo tiene una instancia (Lo escribís una vez y lo usás en varios lados desp.).
const userRepository = new UserRepository()

export default userRepository

