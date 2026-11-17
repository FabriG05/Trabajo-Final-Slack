import express from 'express'
import { getUserById, getUsers, updateProfile } from '../Controllers/UserControllers.js'
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

export default user_router