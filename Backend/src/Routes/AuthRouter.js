import express from 'express'
import { login, register, verifyEmail } from '../Controllers/AuthControllers.js'

const authRouter = express.Router()


authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.get('/verify-email/:verifyEmailToken', verifyEmail)


export default authRouter