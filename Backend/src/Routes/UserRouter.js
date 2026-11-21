import express from 'express'
import { getCurrentUser, getUserById, getUsers, updateProfile, updateStatus } from '../Controllers/UserControllers.js'
import authMiddleware from '../Middlewares/AuthMiddleware.js'

const user_router = express.Router()

user_router.get(
    '/',
    getUsers
)

// Must be declared before /:user_id so "me" is not read as an id.
user_router.get(
    '/me',
    authMiddleware,
    getCurrentUser
)

user_router.get(
    '/:user_id',
    getUserById
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