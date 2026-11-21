import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        profile_photo: { type: String, default: null, alias: 'profilePhoto' },
        created_at: { type: Date, default: Date.now },
        active: { type: Boolean, default: true },
        verified_email: { type: Boolean, default: false },
        status: { type: String, enum: ['online', 'away', 'offline', 'do not disturb'], default: 'online' }
    }
)

export const UserCollection = 'User'
const User = mongoose.model('User', userSchema)

export default User