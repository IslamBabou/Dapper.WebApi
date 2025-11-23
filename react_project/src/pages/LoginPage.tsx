import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api, { setAuthToken } from "../services/api";
import type { LoginResponse } from "../types/LoginResponse";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const login = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!username.trim() || !password.trim()) {
            setError("Username and password are required");
            return;
        }

        try {
            setLoading(true);
            const res = await api.post<LoginResponse>("/Auth/login", {
                username,
                password,
            });

            const { token, role } = res.data;

            // Save to localStorage
            setAuthToken(token);
            localStorage.setItem("token", token);
            localStorage.setItem("role", role);
            localStorage.setItem("username", username); // Save username here!

            // Redirect based on role
            if (role === "Admin") {
                navigate("/admin");
            } else {
                navigate("/");  // Home page (products)
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Invalid username or password");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center bg-light">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-5">
                        <div className="card shadow">
                            <div className="card-body p-5">
                                <div className="text-center mb-4">
                                    <h2 className="fw-bold">Welcome Back</h2>
                                    <p className="text-muted">Login to your account</p>
                                </div>

                                {error && (
                                    <div className="alert alert-danger" role="alert">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={login}>
                                    <div className="mb-3">
                                        <label className="form-label">Username</label>
                                        <input
                                            type="text"
                                            className="form-control form-control-lg"
                                            placeholder="Enter username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label">Password</label>
                                        <input
                                            type="password"
                                            className="form-control form-control-lg"
                                            placeholder="Enter password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            disabled={loading}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-lg w-100 mb-3"
                                        disabled={loading}
                                    >
                                        {loading ? "Logging in..." : "Login"}
                                    </button>

                                    <div className="text-center">
                                        <p className="text-muted mb-2">
                                            Don't have an account?{" "}
                                            <Link to="/register" className="text-primary fw-bold">
                                                Register here
                                            </Link>
                                        </p>
                                        <Link to="/" className="text-muted small">
                                            Continue as guest →
                                        </Link>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}