import React, { useState } from 'react'
import useForm from '../../Hooks/userForm'
import { logIn } from '../../Services/AuthService'


function LogInScreen() {

    const initialState = { email: '', password: '' }
    const { formState, handleChangeInput } = useForm(initialState)

    function handleSubmit(event) {
        event.preventDefault()
        console.log('The user is trying to log in.', formState)
    }

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
                <button type='submit'>Log In</button>
            </form>
        </div>
    )
}

export default LogInScreen