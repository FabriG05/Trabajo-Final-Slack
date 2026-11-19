import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
    {
        timestamp: { type: Date, default: Date.now },
        ip: { type: String, required: true },
        url: { type: String, required: true },
        endpoint: { type: String, required: true },
        method: { type: String, required: true },
        status_code: { type: Number, required: true },
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        duration_ms: { type: Number, required: true }
    }
)

export const LogCollection = 'Log'
const Log = mongoose.model('Log', logSchema)

export default Log
