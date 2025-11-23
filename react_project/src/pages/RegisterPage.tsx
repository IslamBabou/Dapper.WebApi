import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api, { setAuthToken } from "../services/api";

export default function RegisterPage() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const register = async () => {
        setError("");

        // Validation
        if (!username.trim() || !email.trim() || !password.trim()) {
            setError("All fields are required");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address");
            return;
        }

        try {
            setLoading(true);
            const res = await api.post("/Auth/register", {
                username,
                email,
                password,
            });

            const token = res.data.token;
            const role = res.data.user?.role || "User";

            // Save token, role, and username
            localStorage.setItem("token", token);
            localStorage.setItem("role", role);
            localStorage.setItem("username", username);
            setAuthToken(token);

            alert("Registered successfully!");

            // Redirect based on role
            if (role === "Admin") {
                navigate("/admin");
            } else {
                navigate("/");  // Home page (products)
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || "Registration failed. Username or email may already exist.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="card shadow-lg p-4" style={{ width: "400px" }}>
                <h2 className="mb-3 text-center">Create an Account</h2>

                {error && (
                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                        {error}
                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => setError("")}
                            aria-label="Close"
                        ></button>
                    </div>
                )}

                <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input
                        className="form-control"
                        type="text"
                        placeholder="Enter username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={loading}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                        className="form-control"
                        type="email"
                        placeholder="Enter email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                        className="form-control"
                        type="password"
                        placeholder="Enter password (min 6 characters)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Confirm Password</label>
                    <input
                        className="form-control"
                        type="password"
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={loading}
                    />
                </div>

                <button
                    className="btn btn-primary w-100 mb-3"
                    onClick={register}
                    disabled={loading}
                >
                    {loading ? "Registering..." : "Register"}
                </button>

                <div className="text-center">
                    <small className="text-muted">
                        Already have an account?{" "}
                        <Link to="/login" className="text-primary fw-bold">
                            Login here
                        </Link>
                    </small>
                </div>

                <div className="text-center mt-2">
                    <Link to="/" className="text-muted small">
                        Continue browsing products →
                    </Link>
                </div>
            </div>
        </div>
    );
}