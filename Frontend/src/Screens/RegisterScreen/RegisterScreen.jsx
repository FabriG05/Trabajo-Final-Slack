import React from 'react'
import useForm from '../../Hooks/useForm'
import useRequest from '../../Hooks/useRequest'
import { register } from '../../Services/AuthService'

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
        <div>
            <h1>User Registration</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name">Name:</label>
                    <input
                        name='name'
                        id='name'
                        type='text'
                        value={formState.name}
                        onChange={handleChangeInput}
                    />
                </div>
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
                        : <button type='submit'>Register</button>
                }
                {
                    response && !loading && <span style={{ color: 'greenyellow' }}>Registration successful, check your email to verify your account</span>
                }
            </form>
        </div>
    )
}

export default RegisterScreen
