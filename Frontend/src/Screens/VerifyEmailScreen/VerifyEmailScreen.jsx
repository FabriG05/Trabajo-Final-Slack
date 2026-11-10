import React, { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router'
import useRequest from '../../Hooks/useRequest'
import { verifyEmail } from '../../Services/AuthService'
import AuthCard from '../../Components/Auth/AuthCard'
import AuthAlert from '../../Components/Auth/AuthAlert'


function VerifyEmailScreen() {
    const [searchParams] = useSearchParams()
    const verificationToken = searchParams.get('verification_token')
    const { loading, response, error, sendRequest } = useRequest()
    const navigate = useNavigate()

    useEffect(
        () => {
            if (verificationToken) {
                sendRequest(() => verifyEmail(verificationToken))
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [verificationToken]
    )

    /*
        When the token is verified successfully, redirect to /login.
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
            title='Verifying your email'
            subtitle='Please wait while we confirm your account.'
            footer={{
                text: 'Already verified?',
                linkText: 'Go to log in',
                to: '/login'
            }}
        >
            {
                !verificationToken
                &&
                <AuthAlert
                    type='error'
                    title='Invalid link'
                    message='No verification token was provided. Please use the link we sent to your email.'
                />
            }

            {
                verificationToken && loading
                &&
                <AuthAlert
                    type='info'
                    title='Verifying...'
                    message='We are verifying your email. Please wait a moment.'
                />
            }

            {
                verificationToken && !loading && error
                &&
                <AuthAlert
                    type='error'
                    title='We could not verify your email'
                    message={error}
                />
            }

            {
                verificationToken && !loading && response && !error
                &&
                <AuthAlert
                    type='success'
                    title='Email verified!'
                    message='Your account was verified successfully. Redirecting you to the log in page...'
                />
            }
        </AuthCard>
    )
}

export default VerifyEmailScreen
