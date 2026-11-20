import React from "react";
import { Outlet, Navigate } from "react-router";
import { useSession } from "../Context/SessionContext";


export default function AuthMiddleware() {
    const { signedIn } = useSession()

    if (signedIn) {
        return <Outlet />
    }
    else {
        return <Navigate to={'/login'} />
    }
}
