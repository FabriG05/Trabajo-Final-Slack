import { createContext, useCallback, useContext, useMemo, useState } from 'react'

/*
    SessionContext: central auth session state. Reads the token from
    localStorage on mount so public screens (like the landing) and
    private ones (like /home) share the same signed-in status, and
    keeps that status in sync when signing in or out.
*/
const TOKEN_KEYS = ['auth_token', 'authToken']

function readToken() {
    return localStorage.getItem(TOKEN_KEYS[0]) || localStorage.getItem(TOKEN_KEYS[1])
}

const SessionContext = createContext(null)

export function SessionProvider({ children }) {
    const [token, setToken] = useState(readToken)

    const signIn = useCallback((newToken) => {
        TOKEN_KEYS.forEach((key) => localStorage.setItem(key, newToken))
        setToken(newToken)
    }, [])

    const signOut = useCallback(() => {
        TOKEN_KEYS.forEach((key) => localStorage.removeItem(key))
        setToken(null)
    }, [])

    const value = useMemo(
        () => ({ token, signedIn: Boolean(token), signIn, signOut }),
        [token, signIn, signOut]
    )

    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    )
}

export function useSession() {
    const context = useContext(SessionContext)

    if (!context) {
        throw new Error('useSession must be used within a SessionProvider')
    }

    return context
}
