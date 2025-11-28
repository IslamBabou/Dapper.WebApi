import AdminSidebar from "../../components/AdminSidebar";

export default function AdminDashboard() {
    return (
        <div className="d-flex">
            <AdminSidebar />

            <div className="p-4" style={{ flex: 1 }}>
                <h2>Admin Dashboard</h2>
                <p>Welcome! Choose an option from the left menu.</p>
            </div>
        </div>
    );
}