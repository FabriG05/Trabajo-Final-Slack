import React from 'react'
import useForm from '../../Hooks/useForm'
import useRequest from '../../Hooks/useRequest'
import { forgotPassword } from '../../Services/AuthService'
import AuthCard from '../../Components/Auth/AuthCard'
import AuthForm from '../../Components/Auth/AuthForm'

/*
    Step 1 of the password reset flow. Asks for the email address and
    performs a POST to /api/auth/forgot-password. When the account
    exists, the backend sends an email with a link to
    /reset-password?reset_token=<token>. The same success message is
    shown no matter what, so the screen never reveals whether the
    account exists.
*/
function ForgotPasswordScreen() {
    const initialState = { email: '' }
    const { formState, handleChangeInput } = useForm(initialState)
    const { loading, response, error, sendRequest } = useRequest()

    async function handleSubmit(event) {
        event.preventDefault()
        sendRequest(() => forgotPassword(formState.email))
    }

    return (
        <AuthCard
            title='Forgot your password?'
            subtitle='Enter your email address and we will send you a link to reset it.'
            footer={{
                text: 'Remembered it?',
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
                submitLabel='Send reset link'
                loadingLabel='Sending...'
                successTitle='Check your email!'
                successMessage={response ? response.message : null}
            />
        </AuthCard>
    )
}

export default ForgotPasswordScreen
