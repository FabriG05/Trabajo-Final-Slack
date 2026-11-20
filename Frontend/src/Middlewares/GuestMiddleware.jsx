import { Outlet, Navigate } from "react-router";
import { useSession } from "../Context/SessionContext";

/*
    Guard for auth screens (login, register). A signed-in user has
    no reason to see them, so they go straight to the workspace list.
*/
export default function GuestMiddleware() {
    const { signedIn } = useSession()

    if (signedIn) {
        return <Navigate to={'/home'} replace />
    }
    else {
        return <Outlet />
    }
}
