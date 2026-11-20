import React, { useEffect } from 'react'
import useForm from '../../../Hooks/useForm'
import { login } from '../../../Services/AuthService'
import useRequest from '../../../Hooks/useRequest'
import { Link, useLocation, useNavigate } from 'react-router'
import AuthCard from '../../../Components/Auth/JSX/AuthCard'
import AuthForm from '../../../Components/Auth/JSX/AuthForm'
import AuthGoogleButton from '../../../Components/Auth/JSX/AuthGoogleButton'
import { useSession } from '../../../Context/SessionContext'


function LoginScreen() {

    const initialState = { email: '', password: '' }
    const { formState, handleChangeInput } = useForm(initialState)
    const { loading, response, error, sendRequest } = useRequest()
    const { signIn } = useSession()
    const navigate = useNavigate()
    const location = useLocation()

    async function handleSubmit(event) {
        event.preventDefault()
        sendRequest(
            () => login(formState.email, formState.password)
        )
        console.log('User attempting to log in', formState)
    }

    useEffect(
        () => {
            if (response && response.data) {
                const token = response.data.token || response.data.authToken
                if (token) {
                    signIn(token)
                    // Links like the workspace invitation can ask to come
                    // back to their page right after logging in.
                    navigate(location.state?.redirectTo ?? '/home')
                }
            }
        },
        [response, navigate, location.state?.redirectTo, signIn]
    )


    return (
        <AuthCard
            title='Enter your email address to sign in'
            subtitle='Or choose another way to sign in.'
            footer={{
                text: 'New to Slack?',
                linkText: 'Create an account',
                to: '/register'
            }}
        >
            <AuthGoogleButton />
            <AuthForm
                fields={[
                    { name: 'email', type: 'email', label: 'Email', autoComplete: 'email', placeholder: 'name@work-email.com' },
                    { name: 'password', type: 'password', label: 'Password', autoComplete: 'current-password' }
                ]}
                values={formState}
                onChange={handleChangeInput}
                onSubmit={handleSubmit}
                loading={loading}
                error={error}
                submitLabel='Log in'
                loadingLabel='Logging in...'
            />
            <p className='auth-card__helper'>
                Forgot your password?{' '}
                <Link className='auth-card__footer-link' to='/forgot-password'>
                    Reset it
                </Link>
            </p>
            <p className='auth-card__helper'>
                Did not receive your verification email?{' '}
                <Link className='auth-card__footer-link' to='/resend-email-verification'>
                    Resend it
                </Link>
            </p>
        </AuthCard>
    )
}

export default LoginScreen
