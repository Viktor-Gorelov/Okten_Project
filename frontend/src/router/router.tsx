import React, {JSX} from "react";
import { createBrowserRouter, RouteObject, Navigate } from "react-router-dom";
import App from "../App";
import LoginPage from "../pages/LoginPage";
import OrdersPage from "../pages/OrdersPage";
import AdminPanelPage from "../pages/AdminPanelPage";
import {jwtDecode, JwtPayload} from "jwt-decode";
import ActivatePage from "../pages/ActivatePage";

const isAuthenticated = (): boolean => {
    const token = localStorage.getItem("accessToken");
    return !!token;
};

const getUserRole = (): string | null => {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;

    try {
        const decoded = jwtDecode<JwtPayload & { roles: string | string[] }>(token);
        const role = Array.isArray(decoded.roles) ? decoded.roles[0] : decoded.roles;
        return role || null;
    } catch (error) {
        console.error("Invalid token:", error);
        return null;
    }
};

const GuestRoute = ({ children }: { children: JSX.Element }) => {
    return isAuthenticated() ? <Navigate to="/orders" /> : children;
};

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    return isAuthenticated() ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }: { children: JSX.Element }) => {
    return isAuthenticated() && getUserRole() === "ADMIN" ? children : <Navigate to="/orders" />;
};

const PublicRoute = ({ children }: { children: JSX.Element }) => {
    return children;
};


const routes: RouteObject[] = [
    {
        path: "",
        element: <App />,
        children: [
            {
                path: "/login",
                element: (
                    <GuestRoute>
                        <LoginPage/>
                    </GuestRoute>
                ),
            },
            {
                path: "/orders",
                element: (
                    <ProtectedRoute>
                        <OrdersPage/>
                    </ProtectedRoute>
                ),
            },
            {
                path: "/adminPanel",
                element: (
                    <AdminRoute>
                        <AdminPanelPage/>
                    </AdminRoute>
                ),
            },
            {
                path: "/activate/:token",
                element:(
                    <PublicRoute>
                        <ActivatePage/>
                    </PublicRoute>
                ),
            },
            {
                path: "/",
                element: <Navigate to={isAuthenticated() ? "/orders" : "/login"} />,
            },
        ],
    },
];

export const router = createBrowserRouter(routes);