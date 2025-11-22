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
    const [newEmail, setNewEmail] = useState("");
    const [creating, setCreating] = useState(false);

    // Edit states
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editUsername, setEditUsername] = useState("");
    const [editPassword, setEditPassword] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [updating, setUpdating] = useState(false);

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
        if (!newUsername.trim() || !newPassword.trim() || !newEmail.trim()) {
            alert("Username, password, and email are required");
            return;
        }

        try {
            setCreating(true);
            await api.post("/Auth/register", {
                username: newUsername,
                password: newPassword,
                email: newEmail
            });

            alert("User created successfully!");
            setNewUsername("");
            setNewPassword("");
            setNewEmail("");
            setShowCreateForm(false);
            fetchUsers();
        } catch (err) {
            alert("Failed to create user");
            console.error(err);
        } finally {
            setCreating(false);
        }
    };

    const startEdit = (user: User) => {
        setEditingUser(user);
        setEditUsername(user.username);
        setEditEmail(user.email || "");
        setEditPassword(""); // Keep empty, only update if changed
        setShowCreateForm(false); // Close create form if open
    };

    const cancelEdit = () => {
        setEditingUser(null);
        setEditUsername("");
        setEditEmail("");
        setEditPassword("");
    };

    const handleUpdateUser = async () => {
        if (!editingUser) return;

        if (!editUsername.trim() || !editEmail.trim()) {
            alert("Username and email are required");
            return;
        }

        try {
            setUpdating(true);

            const updateData: any = {
                username: editUsername,
                email: editEmail,
            };

            if (editPassword.trim()) {
                updateData.password = editPassword;
            }

            await api.put(`/Admin/update/${editingUser.id}`, updateData);

            alert("User updated successfully!");
            cancelEdit();
            fetchUsers();
        } catch (err) {
            alert("Failed to update user. Update endpoint may not be implemented on backend.");
            console.error(err);
        } finally {
            setUpdating(false);
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
                        onClick={() => {
                            setShowCreateForm(!showCreateForm);
                            setEditingUser(null); // Close edit form if open
                        }}
                        disabled={editingUser !== null}
                    >
                        {showCreateForm ? "Cancel" : "+ Create New User"}
                    </button>
                </div>

                {/* Create User Form */}
                {showCreateForm && (
                    <div className="card mb-4 border-primary">
                        <div className="card-body">
                            <h5 className="card-title">Create New User</h5>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Username</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={newUsername}
                                        onChange={(e) => setNewUsername(e.target.value)}
                                        placeholder="Enter username"
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        placeholder="Enter email"
                                    />
                                </div>
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

                {/* Edit User Form */}
                {editingUser && (
                    <div className="card mb-4 border-warning">
                        <div className="card-body">
                            <h5 className="card-title text-warning">
                                Edit User: {editingUser.username} (ID: {editingUser.id})
                            </h5>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Username</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editUsername}
                                        onChange={(e) => setEditUsername(e.target.value)}
                                        placeholder="Enter username"
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        value={editEmail}
                                        onChange={(e) => setEditEmail(e.target.value)}
                                        placeholder="Enter email"
                                    />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">
                                    New Password <span className="text-muted">(leave empty to keep current)</span>
                                </label>
                                <input
                                    type="password"
                                    className="form-control"
                                    value={editPassword}
                                    onChange={(e) => setEditPassword(e.target.value)}
                                    placeholder="Enter new password (optional)"
                                />
                            </div>
                            <div className="d-flex gap-2">
                                <button
                                    className="btn btn-warning"
                                    onClick={handleUpdateUser}
                                    disabled={updating}
                                >
                                    {updating ? "Updating..." : "Update User"}
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    onClick={cancelEdit}
                                    disabled={updating}
                                >
                                    Cancel
                                </button>
                            </div>
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
                                                <th>Email</th>
                                                <th>Role</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((user) => (
                                                <tr key={user.id}>
                                                    <td>{user.id}</td>
                                                    <td>{user.username}</td>
                                                    <td>{user.email || <span className="text-muted">N/A</span>}</td>
                                                    <td>
                                                        <span className={`badge ${user.role === "Admin"
                                                            ? "bg-danger"
                                                            : "bg-primary"
                                                            }`}>
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="btn-group" role="group">
                                                            <button
                                                                className="btn btn-sm btn-outline-warning"
                                                                onClick={() => startEdit(user)}
                                                                disabled={editingUser !== null || showCreateForm}
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() => handleDeleteUser(user.id, user.username)}
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
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
                {editingUser && (
                    <div className="alert alert-info mt-4" role="alert">
                        <strong>Note:</strong> When editing a user, leave the password field empty to keep their current password unchanged.
                    </div>
                )}
            </div>
        </div>
    );
}