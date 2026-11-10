import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router'
import useForm from '../../Hooks/useForm'
import useRequest from '../../Hooks/useRequest'
import { resetPassword } from '../../Services/AuthService'
import AuthCard from '../../Components/Auth/AuthCard'
import AuthAlert from '../../Components/Auth/AuthAlert'
import AuthForm from '../../Components/Auth/AuthForm'

/*
    Step 2 of the password reset flow, reached from the email link:
    <URL_FRONTEND>/reset-password?reset_token=<token>

    This screen reads the token from the querystring, asks for the new
    password and a confirmation (both must match), and sends the token
    and the new password to POST /api/auth/reset-password. When the
    password is reset successfully, the user is redirected to /login.
*/
function ResetPasswordScreen() {
    const [searchParams] = useSearchParams()
    const resetToken = searchParams.get('reset_token')
    const initialState = { password: '', confirm_password: '' }
    const { formState, handleChangeInput } = useForm(initialState)
    const { loading, response, error, sendRequest } = useRequest()
    const navigate = useNavigate()
    const [passwordsDoNotMatch, setPasswordsDoNotMatch] = useState(false)

    function handleChange(event) {
        // The mismatch message goes away as soon as the user types again.
        setPasswordsDoNotMatch(false)
        handleChangeInput(event)
    }

    async function handleSubmit(event) {
        event.preventDefault()

        if (formState.password !== formState.confirm_password) {
            setPasswordsDoNotMatch(true)
            return
        }

        setPasswordsDoNotMatch(false)
        sendRequest(() => resetPassword(resetToken, formState.password))
    }

    /*
        When the password is reset successfully, redirect to /login.
        We wait a moment so the user can read the confirmation message.
    */
    useEffect(
        () => {
            if (response && response.ok) {
                const timerId = setTimeout(
                    () => navigate('/login'),
                    2000
                )
                return () => clearTimeout(timerId)
            }
        },
        [response, navigate]
    )

    return (
        <AuthCard
            title='Choose a new password'
            subtitle='Make sure it is at least a few characters long and easy for you to remember.'
            footer={{
                text: 'Remembered it?',
                linkText: 'Go to log in',
                to: '/login'
            }}
        >
            {
                !resetToken
                &&
                <AuthAlert
                    type='error'
                    title='Invalid link'
                    message='No reset token was provided. Please use the link we sent to your email.'
                />
            }

            {
                resetToken
                &&
                <AuthForm
                    fields={[
                        { name: 'password', type: 'password', label: 'New password', autoComplete: 'new-password', placeholder: 'Your new password' },
                        { name: 'confirm_password', type: 'password', label: 'Confirm new password', autoComplete: 'new-password', placeholder: 'Repeat your new password' }
                    ]}
                    values={formState}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    loading={loading}
                    error={passwordsDoNotMatch ? 'Passwords do not match' : error}
                    response={response}
                    submitLabel='Reset password'
                    loadingLabel='Resetting...'
                    successTitle='Password reset!'
                    successMessage={response ? response.message : null}
                />
            }
        </AuthCard>
    )
}

export default ResetPasswordScreen
