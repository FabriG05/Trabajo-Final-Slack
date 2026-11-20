import AuthField from './AuthField'
import AuthButton from './AuthButton'
import AuthAlert from './AuthAlert'
import '../CSS/AuthForm.css'

/*
    Friendly message shown when the request fails because the
    server can not be reached at all (offline, CORS, etc.).
*/
const NETWORK_ERROR_PATTERN = /fetch|network/i
const NETWORK_ERROR_FALLBACK = 'Unable to reach the server. Please check your connection and try again.'

const DEFAULT_ERROR_TITLE = 'Something went wrong'
const DEFAULT_SUCCESS_TITLE = 'Success!'

/*
    Reusable authentication form. Renders the given fields, the
    server feedback alerts and the submit button.
*/
function AuthForm({
    fields,
    values,
    onChange,
    onSubmit,
    loading = false,
    error = null,
    response = null,
    submitLabel = 'Submit',
    loadingLabel = 'Loading...',
    successTitle = DEFAULT_SUCCESS_TITLE,
    successMessage = null
}) {
    /* Show a friendlier message when the server can not be reached. */
    const isNetworkError = error && NETWORK_ERROR_PATTERN.test(error)
    const errorMessage = isNetworkError ? NETWORK_ERROR_FALLBACK : error

    return (
        <form className='auth-form' onSubmit={onSubmit}>
            {

                fields.map(field => (
                    <AuthField
                        key={field.name}
                        id={field.name}
                        label={field.label}
                        name={field.name}
                        type={field.type}
                        value={values[field.name]}
                        onChange={onChange}
                        disabled={loading}
                        autoComplete={field.autoComplete}
                        placeholder={field.placeholder}
                        required={field.required}
                    />
                ))
            }

            {
                !loading
                && error
                &&
                <AuthAlert type='error' title={DEFAULT_ERROR_TITLE} message={errorMessage} />
            }

            {
                !loading
                && response
                && !error
                && successMessage
                &&
                <AuthAlert type='success' title={successTitle} message={successMessage} />
            }

            <AuthButton loading={loading} loadingLabel={loadingLabel}>
                {submitLabel}
            </AuthButton>
        </form>
    )
}

export default AuthForm
