import mongoose from "mongoose";
/* Mongoose trabaja con schema --> Nos permiten definir qué tipo de dato / estructura guardará un documento en una colección. */

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        created_at: { type: Date, default: Date.now },
        active: { type: Boolean, default: true },
        verified_email: { type: Boolean, default: false}
    }
)

export const UserCollection = 'User'
const User = mongoose.model('User', userSchema)

export default User