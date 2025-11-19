import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageProducts from "./pages/admin/ManageProducts";
import ManageAdmins from "./pages/admin/ManageAdmins";
import LoginPage from "./pages/LoginPage";


export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LoginPage />} />

                {/* ADMIN */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<ManageUsers />} />
                <Route path="/admin/products" element={<ManageProducts />} />
                <Route path="/admin/admins" element={<ManageAdmins />} />
            </Routes>
        </BrowserRouter>
    );
}
