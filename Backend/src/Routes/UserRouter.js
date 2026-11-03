import express from 'express'
import { getUserById, getUsers } from '../Controllers/UserControllers.js'

const user_router = express.Router()

user_router.get(
    '/',
    getUsers
)

user_router.get(
    '/:user_id',
    getUserById
)

export default user_router