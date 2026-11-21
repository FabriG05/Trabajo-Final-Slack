import express from 'express'
import { getUserById, getUsers, updateProfile, updateStatus } from '../Controllers/UserControllers.js'
import authMiddleware from '../Middlewares/AuthMiddleware.js'

const user_router = express.Router()

user_router.get(
    '/',
    getUsers
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