import express from 'express'
import { login, register, verifyEmail } from '../Controllers/AuthControllers.js'

const auth_router = express.Router()


auth_router.post('/register', register)
auth_router.post('/login', login)
auth_router.get('/verify-email/:verifyEmailToken', verifyEmail)
auth_router.get('/verify_mail/:verifyEmailToken', verifyEmail)


export default auth_router
