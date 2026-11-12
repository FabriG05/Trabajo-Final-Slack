import '../CSS/AuthAlert.css'

/*
    Banner used to show server-side feedback (errors and
    success confirmations).
*/
function AuthAlert({ type = 'info', title, message }) {
    return (
        <div
            className={`auth-alert auth-alert--${type}`}
            role={type === 'error' ? 'alert' : 'status'}
        >
            {title && <p className='auth-alert__title'>{title}</p>}
            {message && <p className='auth-alert__message'>{message}</p>}
        </div>
    )
}

export default AuthAlert
