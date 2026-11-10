import './AuthField.css'

/*
    Single labeled input used across the authentication forms.
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
    placeholder
}) {
    return (
        <div className='auth-field'>
            <label className='auth-field__label' htmlFor={id}>
                {label}
            </label>

            <input
                className='auth-field__input'
                id={id}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                disabled={disabled}
                autoComplete={autoComplete}
                placeholder={placeholder}
            />
        </div>
    )
}

export default AuthField
