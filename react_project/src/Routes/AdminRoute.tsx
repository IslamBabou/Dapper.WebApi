import type { JSX } from "react";
import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }: { children: JSX.Element }) {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // Not logged in → go to login
    if (!token) return <Navigate to="/" />;

    // Logged in but NOT ADMIN → go to user home
    if (role !== "Admin") return <Navigate to="/products" />;

    // Is admin → allow page
    return children;
}
