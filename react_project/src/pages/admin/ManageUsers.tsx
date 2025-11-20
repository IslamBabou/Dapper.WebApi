import { useState, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import api from "../../services/api";
import type { User } from "../../types/User";

export default function ManageUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Form states
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newUsername, setNewUsername] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await api.get<User[]>("/Admin/users");
            setUsers(res.data);
        } catch (err) {
            setError("Failed to load users");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async () => {
        if (!newUsername.trim() || !newPassword.trim()) {
            alert("Username and password are required");
            return;
        }

        try {
            setCreating(true);
            await api.post("/Auth/register", {
                username: newUsername,
                password: newPassword,
            });

            alert("User created successfully!");
            setNewUsername("");
            setNewPassword("");
            setShowCreateForm(false);
            fetchUsers();
        } catch (err) {
            alert("Failed to create user");
            console.error(err);
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteUser = async (id: number, username: string) => {
        if (!confirm(`Are you sure you want to delete user "${username}"?`)) {
            return;
        }

        try {
            await api.delete(`/Admin/delete/${id}`);
            alert("User deleted successfully!");
            fetchUsers();
        } catch (err) {
            alert("Failed to delete user");
            console.error(err);
        }
    };

    return (
        <div className="d-flex">
            <AdminSidebar />

            <div className="p-4" style={{ flex: 1 }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2>Manage Users</h2>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowCreateForm(!showCreateForm)}
                    >
                        {showCreateForm ? "Cancel" : "+ Create New User"}
                    </button>
                </div>

                {/* Create User Form */}
                {showCreateForm && (
                    <div className="card mb-4">
                        <div className="card-body">
                            <h5 className="card-title">Create New User</h5>
                            <div className="mb-3">
                                <label className="form-label">Username</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    placeholder="Enter username"
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter password"
                                />
                            </div>
                            <button
                                className="btn btn-success"
                                onClick={handleCreateUser}
                                disabled={creating}
                            >
                                {creating ? "Creating..." : "Create User"}
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
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                )}

                {/* Users Table */}
                {!loading && !error && (
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">All Users ({users.length})</h5>
                            {users.length === 0 ? (
                                <p className="text-muted">No users found</p>
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
                                            {users.map((user) => (
                                                <tr key={user.id}>
                                                    <td>{user.id}</td>
                                                    <td>{user.username}</td>
                                                    <td>
                                                        <span className={`badge ${user.role === "Admin"
                                                                ? "bg-danger"
                                                                : "bg-primary"
                                                            }`}>
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-sm btn-danger"
                                                            onClick={() => handleDeleteUser(user.id, user.username)}
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
            </div>
        </div>
    );
}