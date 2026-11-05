import User from "../Models/UserModel.js"

/* 
Un repository es donde manejamos la comunicación con nuestros datos --> Generalmente la DB  
Siempre que podamos, usemos filtros del lado de la base de datos. Son mucho más óptimos que un for of... 
*/

class UserRepository {
    async create(name, email, password) {
        return await User.create({ name: name, email: email, password: password })
    }
    
    async get() {
        const result = await User.find()
        console.log(result)
        return result
    }

    async getByCreationDate(min_date, max_date) {
        const result = await User.find({
            created_at: {
                $gte: new Date(min_date), //Establece una fecha mínima.
                $lt: new Date(max_date) //Establece una fecha máxima.
            }
        })
        console.log(result)
        return result
    }

    async getByName(name) {
        const result = await User.find({ name: name, active: true })
        return result
    }

    async getBySearchTerm(term) {
        const result = await User.find({ name: { $regex: term }, active: true })
        return result
    }

    async getById(user_id) {
        const result = await User.findById(user_id)
        return result
    }

    async getByEmail(email) {
        const result = await User.findOne({ email: email }) //Te devuelve Null si no encuentra o un onbjeto con el resultado. 
        return result
    }

    async deleteById(user_id) {
        const result = await User.findByIdAndDelete(user_id)
        return result
    }

    async delteById(user_id) {
        return await this.deleteById(user_id)
    }

    async softDeleteByID(user_id) {
        const result = await User.findByIdAndUpdate(user_id, { active: false })
        return result
    }

    async updateById(user_id, updateData = { verified_email: true }) {
        return await User.findByIdAndUpdate(
            user_id,
            updateData,
            { new: true }
        )
    }
}

//EL UserRepository es un singleton --> solo tiene una instancia (Lo escribís una vez y lo usás en varios lados desp.).
const user_repository = new UserRepository()

export default user_repository
