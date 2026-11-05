import React from "react";
import { Outlet, Navigate } from "react-router";


export default function AuthMiddleware() {
    const authToken = localStorage.getItem("auth_token") || localStorage.getItem("authToken")

    if (authToken) {
        return <Outlet />
    }
    else {
        return <Navigate to={'/login'} />
    }
}