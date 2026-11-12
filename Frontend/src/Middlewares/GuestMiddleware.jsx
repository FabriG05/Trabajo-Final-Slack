import { Outlet, Navigate } from 'react-router';

/*
    Guard for public screens that only make sense while logged
    out (like the landing page). If a session token exists the
    user goes straight to the home screen instead.
*/
export default function GuestMiddleware() {
    const authToken = localStorage.getItem("auth_token") || localStorage.getItem("authToken")

    if (authToken) {
        return <Navigate to={'/home'} replace />
    }
    else {
        return <Outlet />
    }
}
