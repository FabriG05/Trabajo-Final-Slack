import React, { useEffect } from 'react'
import useForm from '../../Hooks/useForm'
import { login } from '../../Services/AuthService'
import useRequest from '../../Hooks/useRequest'
import { useNavigate } from 'react-router'
import AuthCard from '../../Components/Auth/AuthCard'
import AuthForm from '../../Components/Auth/AuthForm'


function LoginScreen() {

    const initialState = { email: '', password: '' }
    const { formState, handleChangeInput } = useForm(initialState)
    const { loading, response, error, sendRequest } = useRequest()
    const navigate = useNavigate()

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
                    localStorage.setItem('auth_token', token)
                    localStorage.setItem('authToken', token)
                    navigate('/')
                }
            }
        },
        [response]
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
        </AuthCard>
    )
}

export default LoginScreen
