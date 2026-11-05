import React, { useEffect, useState } from 'react'
import useForm from '../../Hooks/useForm'
import { login } from '../../Services/AuthService'
import useRequest from '../../Hooks/useRequest'
import { useNavigate } from 'react-router'


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
        <div>
            <h1>Log In</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input
                        name='email'
                        id='email'
                        type='email'
                        value={formState.email}
                        onChange={handleChangeInput}
                    />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input
                        name='password'
                        id='password'
                        type='password'
                        value={formState.password}
                        onChange={handleChangeInput}
                    />
                </div>
                {
                    error
                    &&
                    !loading
                    &&
                    <span style={{ color: 'red' }}>{error}</span>
                }

                {
                    loading
                        ? <button type='submit' disabled={true}>Loading...</button>
                        : <button type='submit'>Log In</button>
                }

                {
                    response && !loading && <span style={{ color: 'greenyellow' }}>Login successful</span>
                }
            </form>
        </div>
    )
}

export default LoginScreen