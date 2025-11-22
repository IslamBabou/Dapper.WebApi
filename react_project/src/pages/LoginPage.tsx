import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api, { setAuthToken } from "../services/api";
import type { LoginResponse } from "../types/LoginResponse";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const login = async () => {
        try {
            setLoading(true);

            const res = await api.post<LoginResponse>("/Auth/login", {
                username,
                password,
            });

            const { token, role } = res.data;

            setAuthToken(token);
            localStorage.setItem("token", token);
            localStorage.setItem("role", role);

            alert("Logged in as: " + role);

            // Redirect
            navigate(role === "Admin" ? "/admin" : "/products");

        } catch {
            alert("Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="card shadow-lg p-4" style={{ width: "380px" }}>
                <h3 className="text-center mb-4">Welcome Back</h3>

                <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input
                        className="form-control"
                        placeholder="Enter your username"
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                        className="form-control"
                        placeholder="Enter your password"
                        type="password"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button
                    className="btn btn-primary w-100"
                    onClick={login}
                    disabled={loading}
                >
                    {loading ? "Signing in..." : "Login"}
                </button>

                <div className="text-center mt-3">
                    <small>
                        Don't have an account?{" "}
                        <Link to="/register">Register here</Link>
                    </small>
                </div>
            </div>
        </div>
    );
}
