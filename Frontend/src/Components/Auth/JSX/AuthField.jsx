import { useState } from 'react'
import '../CSS/AuthField.css'

function EyeIcon() {
    return (
        <svg
            width='20'
            height='20'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.8'
            strokeLinecap='round'
            strokeLinejoin='round'
            aria-hidden='true'
        >
            <path d='M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z' />
            <circle cx='12' cy='12' r='2.7' />
        </svg>
    )
}

function EyeOffIcon() {
    return (
        <svg
            width='20'
            height='20'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.8'
            strokeLinecap='round'
            strokeLinejoin='round'
            aria-hidden='true'
        >
            <path d='M4 4l16 16' />
            <path d='M9.9 5.8A10.6 10.6 0 0 1 12 5.5c6.4 0 10 6.5 10 6.5a17.6 17.6 0 0 1-3.3 4.1' />
            <path d='M6.4 7.6A17 17 0 0 0 2 12s3.6 6.5 10 6.5c1.2 0 2.3-.2 3.3-.6' />
            <path d='M9.9 9.9a3 3 0 0 0 4.2 4.2' />
        </svg>
    )
}

/*
    Single labeled input used across the authentication forms.
    Password inputs get a toggle to reveal / hide the value.
*/
function AuthField({
    id,
    label,
    name,
    type = 'text',
    value,
    onChange,
    disabled = false,
    autoComplete,
    placeholder,
    required = false
}) {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'
    const inputType = isPassword && showPassword ? 'text' : type

    return (
        <div className='auth-field'>
            <label className='auth-field__label' htmlFor={id}>
                {label}
            </label>

            <div className={`auth-field__control${isPassword ? ' auth-field__control--password' : ''}`}>
                <input
                    className='auth-field__input'
                    id={id}
                    name={name}
                    type={inputType}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    autoComplete={autoComplete}
                    placeholder={placeholder}
                    required={required}
                />

                {
                    isPassword
                    &&
                    <button
                        type='button'
                        className='auth-field__toggle'
                        onClick={() => setShowPassword((visible) => !visible)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        aria-pressed={showPassword}
                        disabled={disabled}
                    >
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                }
            </div>
        </div>
    )
}

export default AuthField
