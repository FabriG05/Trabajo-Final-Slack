import express from 'express'
import { getCurrentUser, updateProfile, updateStatus } from '../Controllers/UserControllers.js'
import authMiddleware from '../Middlewares/AuthMiddleware.js'

const user_router = express.Router()

// Must be declared before any /:param route so "me" is not read as an id.
user_router.get(
    '/me',
    authMiddleware,
    getCurrentUser
)

user_router.put(
    '/profile',
    authMiddleware,
    updateProfile
)

user_router.put(
    '/status',
    authMiddleware,
    updateStatus
)

export default user_router