import React from 'react'
import useForm from '../../../Hooks/useForm'
import useRequest from '../../../Hooks/useRequest'
import { resendVerificationEmail } from '../../../Services/AuthService'
import AuthCard from '../../../Components/Auth/JSX/AuthCard'
import AuthForm from '../../../Components/Auth/JSX/AuthForm'

/*
    Allows re-sending the verification email when the user lost the
    original link. Asks for the email and performs a GET to
    /api/auth/verify-email/:email/resend to request a new token.
*/
function ResendEmailVerificationScreen() {
    const initialState = { email: '' }
    const { formState, handleChangeInput } = useForm(initialState)
    const { loading, response, error, sendRequest } = useRequest()

    async function handleSubmit(event) {
        event.preventDefault()
        sendRequest(() => resendVerificationEmail(formState.email))
    }

    return (
        <AuthCard
            title='Resend your verification email'
            subtitle='Enter your email address and we will send you a new verification link.'
            footer={{
                text: 'Remembered your password?',
                linkText: 'Go to log in',
                to: '/login'
            }}
        >
            <AuthForm
                fields={[
                    { name: 'email', type: 'email', label: 'Email', autoComplete: 'email', placeholder: 'name@work-email.com' }
                ]}
                values={formState}
                onChange={handleChangeInput}
                onSubmit={handleSubmit}
                loading={loading}
                error={error}
                response={response}
                submitLabel='Resend email'
                loadingLabel='Sending...'
                successTitle='Email sent!'
                successMessage={response ? response.message : null}
            />
        </AuthCard>
    )
}

export default ResendEmailVerificationScreen
