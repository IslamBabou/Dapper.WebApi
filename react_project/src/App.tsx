import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageAdmins from "./pages/admin/ManageAdmins";
import ManageProducts from "./pages/admin/ManageProducts";
import ProductsPage from "./pages/ProductsPage";
import AdminRoute from "./Routes/AdminRoute";
import { setAuthToken } from "./services/api";
import RegisterPage from "./pages/RegisterPage";

function App() {
    useEffect(() => {
        // Restore auth token on app load
        const token = localStorage.getItem("token");
        if (token) {
            setAuthToken(token);
        }
    }, []);

    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LoginPage />} />

                {/* User Routes */}
                <Route path="/products" element={<ProductsPage />} />

                {/* Admin Routes */}
                <Route
                    path="/admin"
                    element={
                        <AdminRoute>
                            <AdminDashboard />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/users"
                    element={
                        <AdminRoute>
                            <ManageUsers />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/admins"
                    element={
                        <AdminRoute>
                            <ManageAdmins />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/products"
                    element={
                        <AdminRoute>
                            <ManageProducts />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/register"
                    element={
                        <RegisterPage  />
                    } />


                {/* Catch all - redirect to login */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;