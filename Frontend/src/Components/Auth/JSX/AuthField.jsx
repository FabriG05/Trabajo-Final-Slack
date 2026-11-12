import '../CSS/AuthField.css'

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
    placeholder,
    required = false
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
                required={required}
            />
        </div>
    )
}

export default AuthField
