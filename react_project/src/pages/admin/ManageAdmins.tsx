import { useState, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import api from "../../services/api";
import type { User } from "../../types/User";

export default function ManageAdmins() {
    const [admins, setAdmins] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Form states
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newUsername, setNewUsername] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await api.get<User[]>("/Admin/users");
            // Filter only admins
            const adminUsers = res.data.filter(user => user.role === "Admin");
            setAdmins(adminUsers);
        } catch (err) {
            setError("Failed to load admins");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAdmin = async () => {
        if (!newUsername.trim() || !newPassword.trim()) {
            alert("Username and password are required");
            return;
        }

        try {
            setCreating(true);
            await api.post("/Admin/create-admin", {
                username: newUsername,
                password: newPassword,
            });

            alert("Admin created successfully!");
            setNewUsername("");
            setNewPassword("");
            setShowCreateForm(false);
            fetchAdmins();
        } catch (err) {
            alert("Failed to create admin");
            console.error(err);
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteAdmin = async (id: number, username: string) => {
        if (!confirm(`Are you sure you want to delete admin "${username}"?`)) {
            return;
        }

        try {
            await api.delete(`/Admin/delete/${id}`);
            alert("Admin deleted successfully!");
            fetchAdmins();
        } catch (err) {
            alert("Failed to delete admin");
            console.error(err);
        }
    };

    return (
        <div className="d-flex">
            <AdminSidebar />

            <div className="p-4" style={{ flex: 1 }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2>Manage Admins</h2>
                    <button
                        className="btn btn-danger"
                        onClick={() => setShowCreateForm(!showCreateForm)}
                    >
                        {showCreateForm ? "Cancel" : "+ Create New Admin"}
                    </button>
                </div>

                {/* Create Admin Form */}
                {showCreateForm && (
                    <div className="card mb-4 border-danger">
                        <div className="card-body">
                            <h5 className="card-title text-danger">Create New Admin</h5>
                            <p className="text-muted small">
                                Admins have full access to manage users, products, and other admins.
                            </p>
                            <div className="mb-3">
                                <label className="form-label">Username</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    placeholder="Enter admin username"
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter secure password"
                                />
                            </div>
                            <button
                                className="btn btn-danger"
                                onClick={handleCreateAdmin}
                                disabled={creating}
                            >
                                {creating ? "Creating..." : "Create Admin"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="text-center p-5">
                        <div className="spinner-border text-danger" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                )}

                {/* Admins Table */}
                {!loading && !error && (
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">All Administrators ({admins.length})</h5>
                            {admins.length === 0 ? (
                                <p className="text-muted">No administrators found</p>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-striped table-hover">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Username</th>
                                                <th>Role</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {admins.map((admin) => (
                                                <tr key={admin.id}>
                                                    <td>{admin.id}</td>
                                                    <td>
                                                        <strong>{admin.username}</strong>
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-danger">
                                                            {admin.role}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleDeleteAdmin(admin.id, admin.username)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Info Alert */}
                <div className="alert alert-info mt-4" role="alert">
                    <strong>Note:</strong> Be careful when managing admin accounts. Admins have full system access.
                </div>
            </div>
        </div>
    );
}