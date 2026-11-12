import '../CSS/AuthButton.css'

/*
    Submit button that shows a native CSS spinner while the
    request is in flight.
*/
function AuthButton({ loading = false, loadingLabel = 'Please wait...', children }) {
    return (
        <button
            className='auth-button'
            type='submit'
            disabled={loading}
        >
            {
                loading
                    ? (
                        <>
                            <span className='auth-button__spinner' aria-hidden='true'></span>
                            {loadingLabel}
                        </>
                    )
                    : children
            }
        </button>
    )
}

export default AuthButton
