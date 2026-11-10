import express from 'express'
import { login, register, verifyEmail, resendVerificationEmail } from '../Controllers/AuthControllers.js'

const auth_router = express.Router()


auth_router.post('/register', register)
auth_router.post('/login', login)
auth_router.get('/verify-email', verifyEmail) // The token travels through the querystring from the frontend: /api/auth/verify-email?verification_token=...
auth_router.get('/verify-email/:email/resend', resendVerificationEmail) // Re-creates the token and re-sends the verification email: /api/auth/verify-email/someone@test.com/resend


export default auth_router
