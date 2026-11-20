import React from 'react'
import useForm from '../../../Hooks/useForm'
import useRequest from '../../../Hooks/useRequest'
import { register } from '../../../Services/AuthService'
import AuthCard from '../../../Components/Auth/JSX/AuthCard'
import AuthForm from '../../../Components/Auth/JSX/AuthForm'
import AuthGoogleButton from '../../../Components/Auth/JSX/AuthGoogleButton'

function RegisterScreen() {
    const initialState = { name: '', email: '', password: '' }
    const { formState, handleChangeInput } = useForm(initialState)
    const { loading, response, error, sendRequest } = useRequest()

    async function handleSubmit(event) {
        event.preventDefault()
        sendRequest(
            () => register(formState.name, formState.email, formState.password)
        )
        console.log('User attempting to register', formState)
    }

    return (
        <AuthCard
            title='First of all, enter your email address'
            subtitle='We suggest using the email address that you use at work.'
            footer={{
                text: 'Already have an account?',
                linkText: 'Log in',
                to: '/login'
            }}
        >
            <AuthGoogleButton />
            <AuthForm
                fields={[
                    { name: 'name', type: 'text', label: 'Name', autoComplete: 'name', placeholder: 'Your name' },
                    { name: 'email', type: 'email', label: 'Email', autoComplete: 'email', placeholder: 'name@work-email.com' },
                    { name: 'password', type: 'password', label: 'Password', autoComplete: 'new-password' }
                ]}
                values={formState}
                onChange={handleChangeInput}
                onSubmit={handleSubmit}
                loading={loading}
                error={error}
                response={response}
                submitLabel='Register'
                loadingLabel='Registering...'
                successTitle="You're all set!"
                successMessage='Registration successful. Check your email to verify your account.'
            />
        </AuthCard>
    )
}

export default RegisterScreen
