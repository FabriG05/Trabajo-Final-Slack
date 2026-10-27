import express from 'express'
import { getUserById, getUsers } from '../Controllers/UserControllers.js'

const userRouter = express.Router()

userRouter.get(
    '/',
    getUsers
)

userRouter.get(
    '/:user_id',
    getUserById
)

export default userRouter