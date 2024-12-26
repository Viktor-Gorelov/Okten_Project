import React, {JSX} from "react";
import { createBrowserRouter, RouteObject, Navigate } from "react-router-dom";
import App from "../App";
import LoginPage from "../pages/LoginPage";
import OrdersPage from "../pages/OrdersPage";

const isAuthenticated = (): boolean => {
    const token = localStorage.getItem("accessToken");
    return !!token;
};

const GuestRoute = ({ children }: { children: JSX.Element }) => {
    return isAuthenticated() ? <Navigate to="/orders" /> : children;
};

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    return isAuthenticated() ? children : <Navigate to="/login" />;
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
                        <LoginPage />
                    </GuestRoute>
                ),
            },
            {
                path: "/orders",
                element: (
                    <ProtectedRoute>
                        <OrdersPage />
                    </ProtectedRoute>
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